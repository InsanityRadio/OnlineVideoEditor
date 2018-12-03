module OVE
	module HLS
		class Manifest
			# This class generates a valid HLS manifest from a OVE::HLS::Manifest.
			class ManifestGenerator
				def initialize(manifest)
					@manifest = manifest
				end

				def to_s
					data = <<~HEADER
						#EXTM3U
						#EXT-X-VERSION:3
						#EXT-X-MEDIA-SEQUENCE:#{@manifest.media_sequence}
						#EXT-X-TARGETDURATION:#{@manifest.target_duration}
						#EXT-X-PROGRAM-DATE-TIME:#{@manifest.start_date.iso8601}
					HEADER
					@manifest.chunks.each do |chunk|
						data << "#EXTINF:#{chunk.length.to_f}\n"
						data << chunk.path + "\n"
					end

					data
				end
			end
		end
	end
end
