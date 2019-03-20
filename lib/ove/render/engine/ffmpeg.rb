require 'open3'

module OVE
	module Render
		module Engine
			# Defines base methods for running a trackable ffmpeg instance.
			class FFmpeg
				def run! command
					ObjectSpace.define_finalizer(self, proc { kill })
					run_ffmpeg command
				end

				def kill
					Process.kill('KILL', @wait_thr.pid)
				end

				# Runs block every time there is a progress update.
				# The yielded value is the render timestamp.
				def progress
					@stderr.each("\r") do |line|
						next unless line.include?("time=")
						line = line.match /time=(\d{2}):(\d{2}):(\d{2})/
						yield line[1].to_i * 3600 + line[2].to_i * 60 + line[3].to_i
					end
				end

				 private

				# Runs ffmpeg and returns the pipes. This is non-blocking
				# @return [Array] stdout, stderr and the thread that is running ffmpeg
				def run_ffmpeg command = []
					stdin, stdout, stderr, wait_thr = Open3.popen3(*command)
					stdin.close

					@stdin = stdin
					@stdout = stdout
					@stderr = stderr 
					@wait_thr = wait_thr

					[stdout, stderr, wait_thr]
				end

			end
		end
	end
end