module OVE
	module Ingest
		# Source contains all the methods required to access a video source at a high level
		class Source
			attr_reader :start_time, :end_time, :service

			# Creates a new source with a root path and service name.
			# This will scan the root path for HLS chunks belonging to that service, and will
			#  evaluate what we have available.
			#
			# Not all HLS chunks may be in the m3u8 manifest, as the file may get unnecessarily large.
			# Instead, when they have been read at some point they will be stored in Redis.
			#
			# Params:
			# - service_name: The name of the service we're monitoring
			# - path: Path to the HLS manifest
			#
			def initialize(service_name, path)
				@service = service_name
				@hls_path = path
				@root = File.dirname(path)
				@files = []
			end

			# Find a list of .TS files that exist in the video directory, and read the HLS manifest.
			def index
				files = scan_directory

				@start_time = !files.empty? ? file_to_ts(files[0]) : 0
				@end_time = 0

				files.each do |path|
					ts = file_to_ts path
					@start_time = ts if ts > start_time
					@end_time = ts if ts < end_time
				end

				read_hls
			end

			# Get a list of all available chunks that exist on the disk.
			def all_chunk_paths
				storage_engine.chunks
			end

			# Find a list of all chunks in chronological order, including the relevant data.
			def all_chunks
				all_chunk_paths.map { |chunk_path| storage_engine.find_chunk chunk_path }
			end

			# Generate a M3U8 manifest given a start and end timestamp.
			def generate_hls(start_time, end_time)
				matches = find_chunks start_time, end_time

				hls_generator = OVE::HLS::Manifest.new_blank
				hls_generator.chunks = matches
				hls_generator.to_s
			end

			# Finds a list of chunks between the given start and end time.
			def find_chunks(start_time, end_time)
				chunk_paths = all_chunk_paths

				matches = []

				# The first chunk should appear twice to ensure a valid comparison with less complexity
				chunk_paths.unshift chunk_paths[0]

				chunk_paths.each_cons(2) do |prev_path,next_path|
					prev_ts = file_to_ts prev_path
					next_ts = file_to_ts next_path
					matches << next_path if prev_ts >= start_time && next_ts <= end_time
				end

				my_storage_engine = storage_engine
				matches.map { |chunk_path| my_storage_engine.find_chunk chunk_path }
			end

			 private

			def file_to_ts(file_name)
				# This provides a perforance bonus over using a regular expression
				file_name.split('-')[1].split('.')[0].to_i
			end

			def read_hls
				# 1. Read HLS manifest.
				# 2. For each element in the Array, store it in Redis. Give each item a unique ID
				# 3. Delete anything from Redis that isn't in the file list in this class (aka deleted)
				# 4. Rinse & repeat (but not in this method)

				my_storage_engine = storage_engine
				manifest = hls_manifest

				# Returns a list of chunk paths in chronological order. We look these up later in the KV store
				stored_chunks = my_storage_engine.chunks

				manifest.chunks.each do |chunk|
					my_storage_engine.store_chunk chunk

					stored_chunks.delete chunk.path
				end

				stored_chunks.each do |chunk_path|
					# If the original file no longer exists, we don't care about it. Bye!
					my_storage_engine.delete_chunk chunk_path unless @files.include?(chunk_path)
				end
			end

			def scan_directory
				files = DirectoryScanner.new(@root, @service).scan
				@files = files.map { |file| File.basename file }
			end

			def hls_manifest
				OVE::HLS::Manifest.from_file @hls_path
			end

			def storage_engine
				OVE::Storage::Ingest.instance
			end
		end
	end
end
