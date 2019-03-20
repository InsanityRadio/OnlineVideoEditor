module OVE
	module Ingest
		# This class allows us to find the sources that are available to the ingest engine.
		# It keeps track of instances of each class
		class SourceProvider
			# We need to disable class variable checking to use singleton methods correctly.
			# rubocop:disable Style/ClassVars
			def self.instance
				@@instance ||= new
				@@instance
			end
			#rubocop:enable Style/ClassVars

			def sources
				source_list = ['video']
				path = ENV['DEBUG'] == '1' ? (Dir.pwd + '/video/video.m3u8') : '/video/video.m3u8'

				# Enumerate our configuration file and see what we have.
				# These are immutable throwaway objects.
				source_list.map { |s| Source.new(s, path) }
			end
		end
	end
end
