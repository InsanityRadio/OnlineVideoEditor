require 'open-uri'
require 'json'

module OVE
	module Render
		class Base
			def initialize video
				@video = video
				@manager = TempFileManager.new
			end

			def progress_update &block
				@progress_update = block
			end

			def abort &block
				@abort = block
			end

			def abort!
				@manager.clean
				@abort.call
			end

			def clean!
				@manager.clean
			end

			def render!
				# 1. Download target video to temp directory. Can we use HLS as input and does it support itsoffset and tt? A: Yes. We can. 
				# 2. Call render method on child with temp path and output path
				# 3. Save to database.
				@data = load_metadata @video
				@source_path = resolve_video(@video) + '/preview.m3u8'
				@output_path = @manager.create('.mp4')
				render_video 

				if File.size?(@output_path) < 1000
					raise 'Final video size implies failure, aborting'
				end
			end

			def output_path
				@output_path
			end

			def start_time
				@data['start_offset']
			end

			def length
				@data['length']
			end

			def download_source
				@source_path = @manager.create
				Downloader.new(resolve_video(@video) + '/preview.m3u8', @source_path) do |percent|
					# 0-10% is download progress
					@progress_update.call(percent / 10)
				end
			end

			private

			# Determine the path to this video from the import engine
			def resolve_video video
				import = video.import
				uuid = import.uuid
				service = import.service

				$config['ingest']['public_uri'] + '/' + service + '/import/' + uuid
			end

			# Find the appropriate metadata from the import engine
			def load_metadata video
				data = JSON.parse(open(resolve_video(video)).read)
				data['import']
			end

			# Given a command (an array), complete video render with status updates. 
			def render_video_with_command command
				ffmpeg = Engine::FFmpeg.new
				ffmpeg.run! command

				ffmpeg.progress do |prog|
					@progress_update.call((100 * prog / final_duration).to_i, 'Rendering')
				end
			end

		end
	end
end
