module OVE
	module Ingest
		# Scans a directory for files relating to a given service
		class DirectoryScanner
			def initialize(root, service)
				@root = root
				@service = service
			end

			def scan
				files = []

				Dir.chdir(@root) do
					files = Dir.glob(@service + '-*.ts')
				end

				files
			end
		end
	end
end
