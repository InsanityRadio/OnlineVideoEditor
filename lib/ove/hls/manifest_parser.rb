module OVE
	module HLS
		class Manifest
			class ManifestParser

				attr_reader :target_duration, :version, :media_sequence

				def initialize manifest

					manifest = manifest.tr("\r", '').split("\n")

					raise "Not a HLS manifest" if manifest[0] != "#EXTM3U"

				end

			end
		end
	end
end