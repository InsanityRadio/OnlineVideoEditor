require 'open3'

module OVE
	module Transmux
		# Defines base methods for handling ffmpeg conversions.
		# As this only transmuxes the file, this relies on real_start_time/real_end_time, so the
		# provided video is not absolutely perfect. This avoids CPU overhead/quality loss through
		# re-encoding, as we only ideally want to re-encode a file once. 
		class Base
			def initialize ts_paths = []
				@ts_paths = ts_paths
			end

			def run!
			end

			 private

			# Runs ffmpeg and returns the pipes. This is non-blocking
			# @return [Array] stdout, stderr and the thread that is running ffmpeg
			def run_ffmpeg command = []
				command = finish_command(command)
				# run ffmpeg

				p 'running'
				p command

				stdin, stdout, stderr, wait_thr = Open3.popen3(*command)
				stdin.close

				[stdout, stderr, wait_thr]
			end

			# Given a command, replace the unknowns (:input, :output) with executable values
			def finish_command command
				command = command.collect do |value|
					case value
					when :input
						generate_input
					when :output
						generate_output
					else
						value
					end
				end
				[ffmpeg_bin_path] + command
			end

			# Returns the path to the system ffmpeg binary
			def ffmpeg_bin_path
				'ffmpeg'
			end

			# Create a ffmpeg concat: filter that joins all the provided transport stream files
			def generate_input
				'concat:' + @ts_paths.join('|')
			end

			# By default, write to a pipe (allows us to safely serve a file as its being created)
			def generate_output
				'pipe:stdout'
			end

		end
	end
end