module OVE
	module Import
		# A simple interface to, given a source and a start/end time, store it on the disk.
		class Import

			def self.instance
				@@instance ||= self.new
			end

			def import source, start_time, end_time
				chunks = source.find_chunks(start_time, end_time)

				return false if chunks.length == 0
				engine = storage_engine

				chunk_start_time = chunks[0].time

				data = {
					start_time: start_time,
					end_time: end_time,
					real_start_time: chunks[0].time,
					real_end_time: chunks[-1].time,
					length: end_time - start_time,
					start_offset: start_time - chunk_start_time,

					# We also need to store chunk data that's not persistent in Redis.
					chunk_data: chunks.map { |chunk| chunk.serialize }
				}

				uuid = engine.store chunks, data

				data[:uuid] = uuid
				data
			end

			 private

			def storage_engine
				OVE::Storage::Import.instance
			end

		end
	end
end
