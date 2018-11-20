module OVE
	module HLS
		class Manifest
			class ManifestGenerator

				def initialize manifest
					@manifest = manifest
				end

				def to_s

					data  = "#EXTM3U\n"
					data << "#EXT-X-VERSION:3\n"
					data << "#EXT-X-MEDIA-SEQUENCE:#{@manifest.media_sequence}\n"
					data << "#EXT-X-TARGETDURATION:#{@manifest.target_duration}\n"

					@manifest.chunks.each { | chunk |
						data << "#EXTINF:#{chunk.length.to_f}\n"
						data << chunk.path + "\n"
					}

					data

				end

			end
		end
	end
end