require 'securerandom'

module OVE
	module Service
		# 
		class Main < HTTPService

			configure do
				use Rack::Session::Cookie,
					:key => 'ove.session.core',
					:httponly => true,
					:expire_after => 31557600,
					:secret => $config['global']['secret_key']
			end

			def authorize!
				unless session[:user_id]
					content_type 'application/json'
					throw :halt, [401, { :authorized => false }.to_json]
				end
			end

			# /auth_request is used internally by nginx to control access to other backends.
			# For instance, a request to /ingest/video/import is 'filtered' through this method.
			# However, nginx handles running the request, as using Ruby would add unnecessary overhead

			get '/auth_request' do
				# verify the user is authenticated and able to make this backend request.
				authorize!
				halt 200
			end

			# /bootstrap returns 
			get '/bootstrap' do
				begin
					# security mechanism here
				rescue StandardError
					session.clear
					send_json(
						authorized: false
					)
					return
				end

				# fudge user ID as 0 for now
				session[:user_id] = 0

				user = OVE::Model::User.find_or_create_by(id: session[:user_id])
				user.name = 'Dummy'
				user.is_admin = user.is_social = true

				session[:csrf_token] ||= SecureRandom.hex

				send_json(
					csrf_token: session[:csrf_token]
				)
			end


			# GET /:user/imports
			# Returns a list of imports for the given user ID. If user ID is _, returns my imports.

			get '/:user/imports' do |user|
				authorize!

				user = session[:user_id] if user == '_'

				imports = Model::User.find(user.to_i).imports

				send_json(
					success: 1,
					imports: imports.map(&:to_h)
				)
			end

			# Interface for associating an upload with the user.
			# As the ingest interface should not be called from this scope.
			# This could be replaced with an internal backend call, but we don't (currently) have the import hostname - this is planned.
			post '/:user/import/new' do |user|
				authorize!

				service = params['service']
				uuid = params['uuid']
				user = session[:user_id] if user == '_'

				next if uuid.to_s.length == 0 or service.to_s.length == 0

				user = Model::User.find(user.to_i)

				import = Model::Import.find_or_create_by(uuid: uuid, service: service)
				import.user_id = user.id
				import.title = params['title']
				import.save

				send_json(
					success: 1,
					import: import.to_h
				)
			end

			# Create a video [draft] based on an import
			# Accepts a video type
			post '/import/:uuid/create_video' do |uuid|
				authorize!

				import = Model::Import.find_by(uuid: uuid)

				user_id = session[:user_id]

				video = Model::Video.new user_id: user_id, video_type: params['type'], configuration: ''
				import.videos << video
				import.save

				send_json(
					success: 1,
					new_video_id: video.id,
					import: import.to_h
				)
			end

			# Create a video [draft] based on an import
			# Accepts a video type
			post '/import/:uuid/delete' do |uuid|
				authorize!
				user_id = session[:user_id]

				import = Model::Import.find_by(uuid: uuid)
				import.destroy

				send_json(
					success: 1
				)
			end

			get '/import/:uuid/' do |uuid|
				authorize!

				import = Model::Import.find_by(uuid: uuid)

				send_json(
					success: 1,
					import: import.to_h
				)
			end

			post '/import/:uuid/:video_id/save' do |uuid, video_id|
				authorize!

				video = Model::Video.find_by(id: video_id)

				configuration = params['configuration'].to_s

				halt 405 if video.queued or video.rendered

				video.configuration = configuration if configuration != nil
				video.save

				send_json(
					success: 1,
					import: video.import.to_h
				)
			end

			post '/import/:uuid/:video_id/delete' do |uuid, video_id|
				authorize!

				video = Model::Video.find_by(id: video_id)
				import = video.import

				halt 405 if video.queued

				video.destroy

				send_json(
					success: 1,
					import: import.to_h
				)
			end

			post '/import/:uuid/:video_id/render' do |uuid, video_id|
				authorize!

				video = Model::Video.find_by(id: video_id)

				video.queued = true

				if video.worker_id != nil
					worker = Resque::Plugins::Status::Hash.get(video.worker_id)

					halt 500 if ['queued', 'working', 'completed'].include? worker.status
				end

				video.worker_id = OVE::Worker::Render.create(video_id: video.id)

				video.save

				send_json(
					success: 1,
					import: video.import.to_h
				)
			end

			get '/import/:uuid/render' do |uuid|
				import = Model::Import.find_by(uuid: uuid)

				videos = import.videos

				send_json(
					success: 1,
					renders: videos.map { |v|
						next if !v.worker_id
						worker = Resque::Plugins::Status::Hash.get(v.worker_id)
						{
							video_id: v.id,
							status: worker.status,
							level: worker.pct_complete,
							state: worker.message
						}
					}.compact
				)
			end

			get '/import/:uuid/:video_id/render' do |uuid, video_id|
				authorize!

				video = Model::Video.find_by(id: video_id)

				halt 404 if video.worker_id == nil

				worker = Resque::Plugins::Status::Hash.get(video.worker_id)

				send_json(
					success: 1,
					status: worker.status,
					level: worker.pct_complete,
					state: worker.message,
				)
			end

			get '/import/:service/:uuid/:video_id/download.mp4' do |service, uuid, video_id|
				authorize!

				video = Model::Video.find_by(id: video_id)

				halt 404 if video == nil or video.output_path.to_s == ''

				send_file(video.output_path, :disposition => 'inline', :filename => File.basename(video.output_path))
			end

			get '/platform/' do
				authorize!

				platforms = Model::Platform.all

				send_json(
					success: 1,
					platforms: platforms.map(&:to_h)
				)
			end

			post '/platform/new' do
				authorize!

				raise 'Invalid platform name' if params['name'].length < 4

				platform = Model::Platform.new(
					name: params['name'],
					platform_type: params['platform_type'],
					default_share_text: params['default_share_text'],
					configuration: params['configuration']
				)

				platform.validate_connection
				platform.save

				send_json(
					success: 1,
					platform: platform.to_h
				)
			end

			get '/platform/:platform_id/' do |platform_id|
				authorize!

				platform = Model::Platform.find_by(id: platform_id)

				send_json(
					success: 1,
					platform: platform.to_h
				)
			end

			post '/platform/:platform_id/save' do |platform_id|
				authorize!

				platform = Model::Platform.find_by(id: platform_id)
				halt 404 if platform == nil

				platform.name = params['name'].to_s if params['name'] != nil
				platform.default_share_text = params['default_share_text'].to_s if params['default_share_text'] != nil

				if params['configuration'] != nil
					platform.configuration = params['configuration'] 
					platform.validate_connection
				end
				
				platform.save

				send_json(
					success: 1,
					platform: platform.to_h
				)
			end

			post '/platform/:platform_id/delete' do |platform_id|
				authorize!

				platform = Model::Platform.find_by(id: platform_id)
				platform.destroy

				send_json(
					success: 1
				)
			end

			post '/import/:uuid/:video_id/share/new' do |uuid, video_id|
				authorize!

				platform_id = params['platform_id'].to_i

				title = params['title'].to_s
				description = params['description'].to_s
				configuration = params['configuration'].to_s

				platform = Model::Platform.find_by(id: platform_id)

				halt 404 if platform == nil 

				video = Model::Video.find_by(id: video_id)
				share = Model::Share.create(
					video_id: video.id,
					platform_id: platform.id,
					user_id: video.import.user_id,
					title: title,
					description: description,
					configuration: configuration
				)

				halt 404 if video == nil 
				worker_id = nil

				# share this on social media if the user's clicked the button after the video render. 
				# :)
				if video.rendered
					share.queued = true
					share.saved

					worker_id = OVE::Worker::Share.create(share_id: share.id)
				end

				send_json(
					success: 1,
					import: video.import.to_h,
					share: share.to_h,
					worker_id: worker_id
				)
			end

			get '/import/:uuid/:video_id/share/:share_id/' do |uuid, video_id, share_id|
				authorize!

				video = Model::Video.find_by(id: video_id)
				share = Model::Share.find_by(id: share_id)

				send_json(
					success: 1,
					import: video.import.to_h,
					share: share.to_h
				)
			end

			post '/import/:uuid/:video_id/share/:share_id/save' do |uuid, video_id, share_id|
				authorize!

				video = Model::Video.find_by(id: video_id)
				share = Model::Share.find_by(id: share_id)

				title = params['title'].to_s
				description = params['description'].to_s
				configuration = params['configuration'].to_s

				halt 405 if share.shared

				share.title = title if title != nil
				share.description = description if description != nil
				share.configuration = configuration if configuration != nil
				share.save

				send_json(
					success: 1,
					import: video.import.to_h,
					share: share.to_h
				)
			end

			post '/import/:uuid/:video_id/share/:share_id/delete' do |uuid, video_id, share_id|
				authorize!

				video = Model::Video.find_by(id: video_id)
				share = Model::Share.find_by(id: share_id)

				halt 405 if share.shared

				share.destroy

				send_json(
					success: 1,
					import: video.import.to_h,
				)
			end

			post '/import/:uuid/:video_id/share/:share_id/now' do |uuid, video_id, share_id|
				authorize!

				video = Model::Video.find_by(id: video_id)
				share = Model::Share.find_by(id: share_id)

				halt 405 if share.queued or share.shared or !video.rendered

				share.queued = true
				share.save

				worker_id = OVE::Worker::Share.create(share_id: share.id)

				send_json(
					success: 1,
					worker_id: worker_id
				)
			end
		end
	end
end
