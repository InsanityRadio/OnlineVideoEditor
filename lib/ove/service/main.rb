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

				configuration = params['configuration']

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

				halt 405 if video.queued or video.rendered

				video.destroy

				send_json(
					success: 1,
					import: import.to_h
				)
			end

			post '/import/:uuid/:video_id/render' do |uuid, video_id|
				authorize!

				video = Model::Video.find_by(video_id)

				configuration = params['configuration']
				video.queued = true

				halt 500

				# create backend render job here

				send_json(
					success: 1,
					import: video.import.to_h
				)
			end

		end
	end
end
