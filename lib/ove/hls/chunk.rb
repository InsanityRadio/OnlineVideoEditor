module OVE
	module HLS
		# This class oversees the reading and generation of HLS manifest files
		class Chunk
			attr_reader :manifest, :chunk_id, :length, :start_time, :path, :gid

			def self.deserialize data, manifest
				self.new manifest, data[:chunk_id], data[:length], data[:path], data[:gid] 
			end

			def initialize(manifest, chunk_id, length, path, gid = nil)
				@manifest = manifest
				@chunk_id = chunk_id
				@length = length
				@start_time = -1
				@path = path

				# GID = guaranteed unique chunk ID for this HLS file
				@gid = gid
			end

			def gid=(my_gid)
				@gid = my_gid
			end

			def serialize
				{
					:chunk_id => @chunk_id,
					:length => @length,
					:path => @path,
					:gid => @gid
				}
			end

			def time
				@path.split('-')[1].split('.')[0].to_i
			rescue StandardError
				-1
			end

			def resolve_to_path; end
		end
	end
end
