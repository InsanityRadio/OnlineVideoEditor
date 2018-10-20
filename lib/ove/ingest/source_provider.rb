module OVE
	module Ingest
		class SourceProvider

			def self.instance
				@@__instance ||= self.new
				@@__instance
			end


			def get_sources

				source_list = ['video']
				path = '/video/'

				# Enumerate our configuration file and see what we have.
				# These are immutable throwaway objects. 

				source_list.map {|s| Source.new(s, path)}

			end

		end
	end
end
