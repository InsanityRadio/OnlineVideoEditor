require 'tempfile'

module OVE
	module Render
		class TempFileManager
			def initialize
				@files = []
			end

			def add temp_file
				@files << temp_file
			end

			def create extension = nil
				file = Tempfile.new(extension != nil ? ['ove', extension] : 'ove').path
				add file
				file
			end

			def clean
				@files.each { |f| File.unlink(f) rescue nil }
			end
		end
	end
end