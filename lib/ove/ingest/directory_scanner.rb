module OVE
	module Ingest
		class DirectoryScanner

			def initialize root, service
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