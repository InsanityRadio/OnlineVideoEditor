require 'securerandom'

module OVE
	module Storage
		# Persistently stores ingest system data (i.e. HLS chunks and indexes)
		class Import < Base
			def initialize working_directory = '/video'
				@working_directory = working_directory
			end

			# @return id [String] Unique identifier to identify this 
			def store chunks, data = {}
				# 1. generate UUID
				# 2. store chunks under UUID
				# 3. store the data as a big phat .JSON in its directory
				# 4. return UUID

				uuid = SecureRandom.hex

				chunks.each do | chunk |
					storage_engine.store_file uuid, chunk.path
					storage_engine.store_file uuid, chunk.path + '.jpg'
				end
				storage_engine.store_metadata uuid, data
				uuid
			end

			def delete import
				storage_engine.delete_category import.uuid
			end

			# Returns a list of chunks stored under the provided unique ID on the disk
			def retrieve uuid
				files = storage_engine.find_files(uuid)
				chunks = files.select { |c| c.end_with? '.ts' }

				metadata = storage_engine.find_metadata(uuid)
				metadata[:uuid] = uuid

				[chunks, metadata, storage_engine.find_expiry(uuid), storage_engine.resolve(uuid, '', true)]
			end

			# Find all categories (directories on disk) and retrieve data for them
			def all
				categories = storage_engine.find_categories.select { |s| s.match /[a-zA-Z0-9]+/ }

				categories.map { |uuid| retrieve(uuid) }
			end

			 private

			def storage_engine
				file_system
			end
		end
	end
end
