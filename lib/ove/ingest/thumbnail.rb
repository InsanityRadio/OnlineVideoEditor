require 'fileutils'

module OVE
	module Ingest
		# Thumbnail provides methods to generate a thumbnail for a given 
		class Thumbnail

			def self.create chunk_path
				self.new.create chunk_path
			end

			def initialize 
			end

			def create chunk_path
				thumbnail_path = chunk_path + '.jpg'
				return if !File.exist?(chunk_path) or File.exist?(thumbnail_path)
				stdout, stderr, wait_thr = OVE::Transmux::Thumbnail.thumbnail(chunk_path)
				return false unless wait_thr.value.success?

				match_file_times chunk_path, thumbnail_path
			end

			private

			# Updates target's filemtime to match source.
			# This allows the automatic clean-up to function as intended. 
			def match_file_times source, target 
				FileUtils.touch(target, :mtime => File.mtime(source))
			end

		end
	end
end