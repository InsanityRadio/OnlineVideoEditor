module OVE
	module Storage

		class Base

			def self.instance
				@@instance ||= {}
				@@instance[self.class.to_s] ||= self.new
			end

			def redis
				@raw_redis ||= OVE::Storage::Driver.get_instance.namespace self.class.to_s
			end

		end

	end
end