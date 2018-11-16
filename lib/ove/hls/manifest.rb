module OVE
	module HLS
		# This class oversees the reading and generation of HLS manifest files
		class Manifest

			def self.from data_string
				self.new data_string
			end

			def self.from_file file
				self.from File.read(file)
			end

			def self.new_blank
				self.new
			end

			attr_reader :text

			attr_reader :target_duration, :version, :media_sequence, :chunks

			def initialize data_string

				@text = data_string

				parser = ManifestParser.new self

				@chunks = parser.chunks
				@target_duration = parser.target_duration
				@version = parser.version
				@media_sequence = parser.media_sequence

			end

		end
	end
end