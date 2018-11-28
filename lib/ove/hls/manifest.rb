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

			def initialize data_string = nil

				@text = data_string

				if data_string != nil
					initialize_with_data_string
				else
					@chunks = []
					@target_duration = 5
					@version = 3
					@media_sequence = -1
				end

			end

			def initialize_with_data_string
				parser = ManifestParser.new self

				@chunks = parser.chunks
				@target_duration = parser.target_duration
				@version = parser.version
				@media_sequence = parser.media_sequence
			end

			def chunks= new_chunks
				@media_sequence = new_chunks[0].gid rescue -1
				@chunks = new_chunks
			end

			def to_s
				ManifestGenerator.new(self).to_s
			end

		end
	end
end