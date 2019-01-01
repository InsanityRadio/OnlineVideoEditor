module OVE
	module Import
		# A simple interface to, given a source and a start/end time, store it on the disk.
		# Depends on OVE::Storage::Import, which contains implementation details
		class Import

			def self.instance
				@@instance ||= self.new
			end

			# Imports a selection of video between the start and end times, and returns a hash of data
			def import source, start_time, end_time
				chunks = source.find_chunks(start_time, end_time)

				return false if chunks.length == 0
				engine = storage_engine source

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

				data[:chunks] = chunks
				data[:uuid] = uuid
				ImportedContent.new data
			end

			def find_by_source source
				from_list storage_engine(source).all
			end

			def find_by_id source, category_id
				from storage_engine(source).retrieve(category_id)
			end

			 private

			def storage_engine source
				OVE::Storage::Import.instance_with_workdir source.root
			end

			def from_list categories
				categories.map { |cat| from cat }
			end

			def from category
				data = category[1]
				data[:chunks] = deserialize_chunks(data[:chunk_data])

				ImportedContent.new data, category[2], category[3]
			end

			# Convert an array of paths into valid chunks
			def deserialize_chunks chunk_data
				chunk_data.map do |chunk|
					OVE::HLS::Chunk.deserialize chunk, nil
				end
			end

		end
	end
end
