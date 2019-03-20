module OVE
	module Ingest
		# Source contains all the methods required to access a video source at a high level
		class CuePoint
			attr_reader :start_time, :end_time, :service

			# Creates a new source with a root path and service name.
			# This will scan the root path for HLS chunks belonging to that service, and will
			#  evaluate what we have available.
			#
			# Not all HLS chunks may be in the m3u8 manifest, as the file may get unnecessarily large.
			# Instead, when they have been read at some point they will be stored in Redis.
			#
			# Params:
			# - service_name: The name of the service we're monitoring
			# - path: Path to the HLS manifest
			#
			def initialize(service_name, start_time, end_time)
				@service = service_name
				@start_time = start_time
				@end_time = end_time
			end

			def self.from hash
				self.new hash["service"], hash["start_time"], hash["end_time"]
			end

			def save
				storage_engine.store_point self
			end

			def storage_engine
				OVE::Storage::CuePoints.instance
			end

			def to_h
				{
					:start_time => @start_time,
					:end_time => @end_time,
					:service => @service
				}
			end
		end
	end
end
