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

				Dir.chdir(@root)

				files = Dir.glob(@service + '-*.ts')

				files
			end
		end
	end
end
