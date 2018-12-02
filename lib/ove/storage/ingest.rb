module OVE
	module Storage
		# Persistently stores ingest system data (i.e. HLS chunks and indexes)
		class Ingest < Base
			# Store the given OVE::HLS::Chunk in our persistent storage, giving it a unique ID
			def store_chunk(chunk, chunk_gid = 0)
				# Chunks never mutate. If they do, the behaviour is undefined.
				return if find_chunk(chunk.path) != false

				chunk_gid = find_gid_for_chunk(chunk) if chunk_gid.zero?

				chunk.gid = chunk_gid

				redis.rpush 'ingest', chunk.path
				redis.hmset(
					'ingest:' + chunk.path, 'gid', chunk_gid, 'chunk_id',
					chunk.chunk_id, 'length', chunk.length, 'start_time', chunk.start_time
				)
			end

			# Delete the chunk at the given storage path
			def delete_chunk(chunk_path)
				redis.lrem 'ingest', 0, chunk_path
				redis.del 'ingest:' + chunk_path
			end

			# Returns an array of the file paths of chunks we're storing currently
			def chunks
				redis.lrange('ingest', 0, -1).to_a
			end

			# Get a reconstructed OVE::HLS::Chunk from chunk_path
			def find_chunk(chunk_path)
				data = redis.hgetall 'ingest:' + chunk_path

				return false if data.nil? || data.empty?

				OVE::HLS::Chunk.new(
					nil,
					data['chunk_id'].to_i,
					data['length'].to_f,
					chunk_path,
					data['gid'].to_i
				)
			end

			def find_gid_for_chunk(target)
				my_chunks = chunks

				my_chunks.each_with_index do |chunk_path, _key|
					# is there a chunk i with the i.chunk_id = chunk.chunk_id + 1?
					# if so, our GID should be that + 1

					chunk = find_chunk(chunk_path)

					unless chunk
						warn "WARNING: There exists a path without a corresponding chunk. Path: #{path}"
						delete_chunk chunk_path
						next
					end

					return chunk.gid + 1 if chunk.chunk_id + 1 == target.chunk_id
				end

				# No results?
				# That means one of two options:
				# 1. We're the first chunk. Default to unix_time of now
				# 2. There's been some sort of a gap, or the ingest source has been restarted.
				# If this is the case, we can just assume we're the next chunk from our last known one.

				return Time.now.to_i if my_chunks.empty?

				chunk = find_chunk(my_chunks[-1])
				offset = target.chunk_id - chunk.chunk_id

				# ~100 minutes.
				return chunk.gid + offset if offset >= 0 && offset < 1200

				chunk.gid + 1
			end
		end
	end
end
