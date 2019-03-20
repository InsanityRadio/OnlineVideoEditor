module OVE
	module HLS
		class Manifest
			# This class is initialised with a HLS manifest string, and is able to parse it to spec
			class ManifestParser
				attr_reader :target_duration, :version, :media_sequence, :chunks

				# rubocop:disable Metrics/AbcSize, Metrics/CyclomaticComplexity
				# rubocop:disable Metrics/MethodLength, Metrics/PerceivedComplexity
				def initialize(manifest)
					@manifest = manifest

					manifest_text = manifest.text.tr("\r", '').split("\n")
					raise 'Not a HLS manifest' if manifest_text[0] != '#EXTM3U'

					offset = 0

					@chunks = ChunkList.new

					manifest_text.inject('') do |prev, line|
						key, val = line.split(':')

						next prev if line.strip == ''

						val_f = val.to_f
						val_i = val.to_i

						# #EXTINF:length is always followed by a path.
						next val_f if key == '#EXTINF'
						if key[0] != '#'
							add_chunk prev, line, offset
							offset += 1
						end

						@version = val_i if key == '#EXT-X-VERSION'
						@media_sequence = val_i if key == '#EXT-X-MEDIA-SEQUENCE'
						@target_duration = val_f if key == '#EXT-X-TARGETDURATION'
					end
				end
				# rubocop:enable Metrics/AbcSize, Metrics/CyclomaticComplexity
				# rubocop:enable Metrics/MethodLength, Metrics/PerceivedComplexity

				private

				def add_chunk(length, path, offset)
					# The chunk_id is (meant to be) unique to this manifest, and the next chunk will be chunk_id+1
					chunk_id = offset + @media_sequence
					@chunks << OVE::HLS::Chunk.new(@manifest, chunk_id, length, path)
				end
			end
		end
	end
end
