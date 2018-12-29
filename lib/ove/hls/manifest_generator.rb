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

					last_chunk = @manifest.chunks[0]

					@manifest.chunks.each do |chunk|
						# Detect discontinuity (an unusual gap) between chunks!
						# (give ~100ms for drift)
						if chunk.time > last_chunk.time + (last_chunk.length * 1000.0) + 100
							new_time = Time.at chunk.time / 1000.0
							data << "#EXT-X-DISCONTINUITY\n"
							data << "#EXT-X-PROGRAM-DATE-TIME:#{new_time.iso8601}\n"
						end

						data << "#EXTINF:#{chunk.length.to_f}\n"
						data << chunk.path + "\n"

						last_chunk = chunk
					end

					data
				end
			end
		end
	end
end
