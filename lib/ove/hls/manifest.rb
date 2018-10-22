module OVE
	module HLS
		# This class oversees the reading and generation of HLS manifest files
		class Manifest

			def self.from data_string
				self.new 
			end

			def self.from_file file
				self.from File.read(file)
			end

			def self.new_blank
				self.new
			end

			def initialize data_string

			end

		end
	end
end