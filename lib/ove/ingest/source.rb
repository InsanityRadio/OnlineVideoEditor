module OVE
	module Ingest
		class Source

			attr_reader :start_time, :end_time, :service

			# Creates a new source with a root path and service name.
			# This will scan the root path for HLS chunks belonging to that service, and will evaluate what we have available.

			# Not all HLS chunks may be in the m3u8 manifest, as the file may get unnecessarily large. 
			# Instead, when they have been read at some point they will be stored in Redis.

			# Params:
			# - service_name: The name of the service we're monitoring
			# - path: Path to the HLS manifest

			def initialize service_name, path

				@service = service_name
				@hls_path = path
				@root = File.dirname(path)

			end

			def index

				files = scan_directory 

				@start_time = files.length > 0 ? file_to_ts(files[0]) : 0
				@end_time = 0

				files.each { |f|
					ts = file_to_ts f
					@start_time = ts if ts > start_time
					@end_time = ts if ts < end_time
				}

				@files = files.map { |f| File.basename f }

				read_hls

			end

			def get_all_chunk_paths
				get_storage_engine.chunks
			end

			def get_all_chunks
				storage_engine = get_storage_engine
				get_all_chunk_paths.map { | chunk_path | storage_engine.get_chunk chunk_path }
			end

			private
			def file_to_ts file_name

				# This provides a perforance bonus over using a regular expression
				file_name.split('-')[1].split('.')[0].to_i

			end

			def read_hls

				# 1. Read HLS manifest. 
				# 2. For each element in the Array, store it in Redis. Give each item a unique ID
				# 3. Delete anything from Redis that isn't in the file list in this class (aka deleted)
				# 4. Rinse & repeat (but not in this method)

				storage_engine = get_storage_engine
				manifest = get_hls_manifest

				# Returns a list of chunk paths in chronological order. We look these up later in the KV store
				stored_chunks = storage_engine.chunks

				manifest.chunks.each do | chunk |

					storage_engine.store_chunk chunk

					stored_chunks.delete chunk.path 

				end

				stored_chunks.each do | chunk_path |

					# If the original file no longer exists, we don't care about it. Bye!
					if !@files.include?(chunk_path)
						storage_engine.delete_chunk chunk_path
					end

				end

			end

			def scan_directory
				DirectoryScanner.new.scan @root, @service
			end

			def get_hls_manifest
				OVE::HLS::Manifest.from_file @hls_path
			end

			def get_storage_engine
				OVE::Storage::Ingest.instance
			end

		end
	end
end