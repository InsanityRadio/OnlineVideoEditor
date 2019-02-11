require 'securerandom'

module OVE
	module Service
		# 
		class Slate < HTTPService
			def authorize!
				unless session[:user_id]
					content_type 'application/json'
					throw :halt, [401, { :authorized => false }.to_json]
				end
			end

			# Returns a list of slates available
			get '/slates/' do
				slates = Model::Slate.all

				send_json(
					success: 1,
					slates: slates.map(&:to_h),
				)
			end

			# Creates a new slate on the server. If cue_point is 0, the video will an outro video.
			post '/slates/new' do 
				name = params[:name].to_s
				cue_point = params[:cue_point].to_f

				file = params[:file]

				raise 'Invalid data' if name.length < 4 or !file or !file[:tempfile]

				slate = Model::Slate.create(
					user_id: session[:user_id],
					name: name,
					cue_point: cue_point,
					is_outro: cue_point == 0
				)

				slate.set_path file[:tempfile]
				slate.save

				send_json(
					success: 1,
					slate: slate.to_h
				)
			end


			# Deletes a slate from the server
			post '/slates/delete' do
				id = params[:id]
				slate = Model::Slate.find_by(id: id)

				if !slate or slate.created_by != session[:user_id]
					send_json(
						success: 0,
						message: 'Access was denied'
					)
				else
					send_json(
						success: 1
					)
				end
			end

			get '/slates/:id/download.mp4' do
				id = params[:id]
				slate = Model::Slate.find_by(id: id)

				halt 404 if slate == nil

				send_file(slate.path, :disposition => 'inline', :filename => File.basename(slate.path))
			end

			get '/slates/:id/thumbnail.jpg' do
				id = params[:id]
				slate = Model::Slate.find_by(id: id)

				halt 404 if slate == nil

				send_file(slate.thumbnail_path, :disposition => 'inline', :filename => File.basename(slate.thumbnail_path))
			end
		end
	end
end
