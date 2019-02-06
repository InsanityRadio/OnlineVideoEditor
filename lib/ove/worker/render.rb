module OVE
	module Worker
		# Render is a worker that allows video to be rendered as per provided specification
		class Render
			include Resque::Plugins::Status

			def perform
				video_id = options['video_id']
				video = OVE::Model::Video.find_by(video_id)

				raise "Video has already been rendered" if video.rendered

				renderer = OVE::Render::RenderProvider.find_by(video.video_type).new video

				renderer.progress_update do |progress, description|
					at(progress, 100, description)
				end

				renderer.abort do |reason|
					raise reason
				end

				renderer.render!
			end
		end
	end
end