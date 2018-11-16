module OVE
	module Storage

		class Base

			def redis
				@raw_redis ||= OVE::Storage::Driver.get_instance.namespace self.class.to_s
			end

		end

	end
end