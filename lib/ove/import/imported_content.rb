module OVE
	module Import
		# A simple interface to, given a source and a start/end time, store it on the disk.
		class ImportedContent

			attr_reader :uuid, :start_time, :end_time, :real_start_time, :real_end_time
			attr_reader :chunks, :root_path

			def initialize data, expiry, root_path
				@uuid = data[:uuid]
				@start_time = data[:start_time]
				@end_time = data[:end_time]
				@real_start_time = data[:real_start_time]
				@real_end_time = data[:real_end_time]
				@chunks = data[:chunks].sort_by { |chunk| chunk.chunk_id }

				@expiry = expiry
				@root_path = root_path
			end

			def serialize millisec = true
				dividor = millisec ? 1 : 1000.0
				{
					uuid: @uuid,
					start_time: @start_time / dividor,
					end_time: @end_time / dividor,
					real_start_time: @real_start_time / dividor,
					real_end_time: @real_end_time / dividor,
					length: (@end_time - @start_time) / dividor,
					start_offset: start_offset / dividor,
					chunk_data: @chunks.map { |chunk| chunk.serialize },
					expiry: @expiry
				}
			end

			def start_offset
				@start_time - @chunks[0].time
			end

			def generate_hls
				hls_generator = OVE::HLS::Manifest.new_blank
				hls_generator.header = [
					'#EXT-X-START:TIME-OFFSET=' + (start_offset / 1000.0).to_s + ',PRECISE=YES'
				]
				hls_generator.chunks = @chunks
				hls_generator.to_s
			end

			def generate_mp4
				paths = @chunks.map { |chunk| @root_path + chunk.path }

				OVE::Transmux::TSMP4.ts_to_mp4(paths)
			end

		end
	end
end