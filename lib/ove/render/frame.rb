require 'base64'

module OVE
	module Render
		class Frame < Base

			def render_video
				@source_path
				@output_path

				@configuration = JSON.parse(@video.configuration)

				load_layers

				# Check in the configuration whether or not the user wants a background. 
				if @configuration['layers.background']
					render_video_with_background 
				else
					render_video_without_background
				end
			end

			# Move images, which are base64 encoded in the configuration object, into real files
			def load_layers
				@foreground_path = save_image @configuration['raw']['foreground']
				@background_path = save_image @configuration['raw']['background']
			end

			def final_duration
				length
			end

			def render_video_with_background
				render_video_with_command([
					'./scripts/frame',
					@source_path + ",#{start_time},#{length}",
					@background_path,
					@output_path
				])
			end

			def render_video_without_background
				render_video_with_command([
					'./scripts/frame',
					@source_path + ",#{start_time},#{length}",
					@foreground_path,
					@background_path,
					@output_path
				])
			end

			private

			# Save a base64-encoded PNG in a temporary file and return it as a path
			def save_image image
				image = Base64::decode64(image.split(',')[1]).b
				path = @manager.create '.png'
				File.open(path, 'wb') do |file|
					file.write image
				end
				path
			end

		end
	end
end
