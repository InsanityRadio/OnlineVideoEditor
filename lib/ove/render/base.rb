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

			def render!
				# 1. Download target video to temp directory. Can we use HLS as input and does it support itsoffset and tt? A: Yes. We can. 
				# 2. Call render method on child with temp path and output path
				# 3. Save to database.
				@data = load_metadata @video
				@output_path = @manager.create
				render_video 
			end

			def start_time
				@data['start_time']
			end

			def end_time
				@data['end_time']
			end

			def length
				@data['length']
			end

			def download_source
				@source_path = @manager.create
				Downloader.new(resolve_video(@video), @source_path) do |percent|
					# 0-10% is download progress
					progress_update.call(percent / 10)
				end
			end

			private
			def resolve_video video
				import = video.import
				uuid = import.uuid
				service = import.service

				$config['ingest']['public_uri'] + '/' + service + '/' + uuid + '/preview.m3u8'
			end

			def load_metadata video
				path = $config['ingest']['public_uri'] + '/' + service + '/' + uuid
				data = JSON.parse(open(path).read)
				data['import']
			end


			# Given a command (an array), complete video render with status updates. 
			def render_video_with_command command
				puts 'I will run the following command to finish my render'
				p command
				raise 'todo'
			end

		end
	end
end
