module OVE
	module Ingest
		class Source

			attr_reader :start_time, :end_time, :service

			# Creates a new source with a root path and service name.
			# This will scan the root path for HLS chunks belonging to that service, and will evaluate what we have available.

			def initialize service, path

				@service = service
				@root = path
				files = scan_directory 

				@start_time = files.length > 0 ? file_to_ts(files[0]) : 0
				@end_time = 0

				files.each { |f|
					ts = file_to_ts f[0]
					@start_time = ts if ts > start_time
					@end_time = ts if ts < end_time
				}

			end

			private
			def scan_directory

				files = []

				Dir.chdir(@root) do 
					files = Dir.glob(@service + '-*.ts')
				end

				files

			end

			def file_to_ts file_name

				# This provides a perforance bonus over using a regular expression
				file_name.split('-')[1].split('.')[0].to_i

			end

		end
	end
end