module OVE
	module Storage
		# Persistently stores ingest system data (i.e. HLS chunks and indexes)
		class CuePoints < Base
			# Store the cue point in Redis, indexed by its end time
			def store_point(point)
				redis.zadd 'cue_points', point.end_time, point.to_h.to_json
			end

			# Delete points older than 24 hours. 
			def clean_points(expiry_time = nil)
				expiry_time = Time.now.to_i - 86400 if expiry_time.nil?
				redis.zremrangebyscore('cue_points', 0, expiry_time)
			end

			# Delete the chunk at the given storage path
			def delete_point(point)
				redis.zrem 'cue_points', point.to_h.to_json
			end

			# Returns an array of the file paths of chunks we're storing currently
			def points
				cue_points = redis.zrange('cue_points', Time.now.to_i - 86400, -1).to_a
				cue_points.map {|point| OVE::Ingest::CuePoint.from JSON.parse(point)}
			end
		end
	end
end
