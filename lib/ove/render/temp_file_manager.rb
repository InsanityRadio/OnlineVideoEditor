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
				tempfile = Tempfile.new(extension != nil ? ['ove', extension] : 'ove')
				path = tempfile.path

				# Keep a reference to tempfile, otherwise it (and its contents) gets GC'd.
				# If we're rendering a video and this takes >60 seconds, this bad. 
				add tempfile
				path
			end

			def clean
				@files.each { |f| f.unlink rescue nil }
			end
		end
	end
end