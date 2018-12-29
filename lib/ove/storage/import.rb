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
					storage_engine.store_file uuid, chunk.path
				end
				storage_engine.store_metadata uuid, data
				uuid
			end

			# Returns a list of chunks stored under the provided unique ID on the disk
			def retrieve uuid
				files = storage_engine.find_files(uuid)
				chunks = files.select { |c| c.end_with? '.ts' }
				[chunks, storage_engine.find_metadata(uuid), storage_engine.find_expiry(uuid)]
			end

			 private

			def storage_engine
				# inject our stubbed storage engine here
				file_system
			end

		end
	end
end
