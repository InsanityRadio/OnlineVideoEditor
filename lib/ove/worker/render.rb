module OVE
	module Worker
		# Render is a worker that allows video to be rendered as per provided specification
		class Render
			include Resque::Plugins::Status

			def perform
				video_id = options['video_id']
				video = OVE::Model::Video.find_by(id: video_id)

				raise "Video has already been rendered" if video.rendered

				renderer = OVE::Render::RenderProvider.find_by(video.video_type).new video

				renderer.progress_update do |progress, description|
					at(progress, 100, description)
				end

				begin
					renderer.abort do |reason|
						raise reason
					end

					renderer.render!

					video.add_output renderer.output_path
					puts "Rendered to #{video.output_path}"

					video.queued = false
					video.save
				ensure
					# Regardless, we should clean up the temporary directories
					renderer.clean!
				end
			end
		end
	end
end