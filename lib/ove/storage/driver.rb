require 'redis'
require 'redis-namespace'

module OVE
	module Storage
		# The storage driver mediates access to databases, except ActiveRecord.
		class Driver
			# Provides a driver to access a key-value store (Redis), handling namespacing.
			class KeyValue
				def initialize
					@raw_redis = Redis.new reconnect_attempts: 99_999, url: ENV['REDIS']
					@redis = Redis::Namespace.new :ove, redis: @raw_redis
				end

				def namespace(name)
					Redis::Namespace.new "ove_#{name}".to_sym, redis: @raw_redis
				end

				private

				def method_missing(method, *args, &block)
					@redis.send method, *args, &block
				end
			end

			# We need to disable class variable checking to use singleton methods correctly.
			# rubocop:disable Style/ClassVars
			def self.kv_instance
				@@kv_instance ||= KeyValue.new
			end
			# rubocop:enable Style/ClassVars
		end
	end
end
