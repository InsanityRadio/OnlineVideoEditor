require 'securerandom'

module OVE
	module Storage
		# Persistently stores ingest system data (i.e. HLS chunks and indexes)
		class Import < Base
			# @return id [String] Unique identifier to identify this 
			def store chunks, data = {}
				# 1. generate UUID
				# 2. store chunks under UUID
				# 3. store the data as a big phat .JSON in its directory
				# 4. return UUID

				uuid = SecureRandom.hex

				chunks.each do | chunk |
					driver.store_file uuid, chunk.path
				end
				file_system.store_metadata uuid, data
				uuid
			end

			# Returns a list of chunks stored under the provided unique ID on the disk
			def retrieve uuid
				files = file_system.find_files(uuid)
				chunks = files.select { |c| c.end_with? '.ts' }
			end
		end
	end
end
