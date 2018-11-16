require 'redis'
require 'redis-namespace'

module OVE
	module Storage

		class Driver

			def self.get_instance
				@@instance ||= self.new
			end

			def initialize

				@raw_redis = Redis.new reconnect_attempts: 99999
				@redis = Redis::Namespace.new :ove, :redis => @raw_redis

			end

			def namespace ns
				Redis::Namespace.new "ove_#{ns}".to_sym, :redis => @raw_redis
			end

			private
			def method_missing (method, *args, &block) 
				@redis.send method, *args, &block
			end

		end

	end
end