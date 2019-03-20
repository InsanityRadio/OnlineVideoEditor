module OVE
	module HLS
		# This class oversees the reading and generation of HLS manifest files
		class Manifest
			def self.from(data_string)
				new data_string
			end

			def self.from_file(file)
				from File.read(file)
			end

			def self.new_blank
				new
			end

			attr_reader :text
			attr_reader :target_duration, :version, :media_sequence, :chunks, :header

			def initialize(data_string = nil)
				@text = data_string
				@header = []

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

			def header= headers
				@header = headers
			end

			def chunks=(new_chunks)
				begin
					@media_sequence = new_chunks[0].gid
				rescue StandardError
					@media_sequence = -1
				end
				@chunks = new_chunks
			end

			def start_date
				return Time.at(-1) if @chunks.empty?

				Time.at @chunks[0].time / 1000.0
			end

			def to_s
				ManifestGenerator.new(self).to_s
			end
		end
	end
end
