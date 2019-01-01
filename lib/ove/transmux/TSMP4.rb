module OVE
	module Transmux
		class TSMP4 < Base
			def self.ts_to_mp4 ts_paths
				TSMP4.new(ts_paths).run!
			end

			def run!
				path = generate_output
				command = [
					'-i', 
					:input,
					'-c', 'copy',
					'-bsf:a', 'aac_adtstoasc',
					'-movflags', 'faststart',
					'-y',
					'-f', 'mp4',
					path
				]
				out = run_ffmpeg command
				[path, out[1], out[2]]
			end

			# With MP4, we can't stream output. Hence, temporary file
			def generate_output
				Tempfile.new('tmux').path
			end

		end
	end
end