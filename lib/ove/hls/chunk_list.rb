module OVE
	module HLS
		# This class oversees the reading and generation of HLS manifest files
		class ChunkList < ::Array

			def initialize data = []
				super data

				@indexed_data = {}
				data.each { |a| @indexed_data[a.path] = a }
			end

			# Override the built in array append method so that we can index our chunks
			def << chunk

				raise "chunk is not of type Chunk" unless chunk.is_a? Chunk 

				super chunk
				@indexed_data[chunk.path] = chunk

			end

			def find_by_name name
				@indexed_data[name]
			end

		end
	end
end