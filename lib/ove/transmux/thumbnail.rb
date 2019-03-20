module OVE
	module Transmux
		class Thumbnail < Base
			def self.thumbnail ts_path
				Thumbnail.new(ts_path).run!
			end

			def initialize ts_path
				super ts_path
				@input = ts_path
			end

			def run!
				command = [
					'-i', 
					@input,
					'-vframes', '1',
					'-vf', 'select=eq(pict_type\,PICT_TYPE_I),scale=-2:300,crop=300:300',
					'-vsync', '0',
					'-y',
					@input + '.jpg'
				]
				run_ffmpeg command
			end

		end
	end
end