module OVE
	module HLS
		# This class oversees the reading and generation of HLS manifest files
		class Chunk

			attr_reader :manifest, :chunk_id, :length, :path
			attr_accessor :gid

			def initialize manifest, chunk_id, length, path, gid = nil

				@manifest = manifest
				@chunk_id = chunk_id
				@length = length
				@path = path

				# GID = guaranteed unique chunk ID for this HLS file
				@gid = gid

			end

			def resolve_to_path
			end

		end
	end
end