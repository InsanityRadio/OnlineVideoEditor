module OVE
	module Storage
		# The storage base allows us to store key/value data persistently, and should be extended
		#  by other classes.
		class Base
			# rubocop:disable Style/ClassVars
			def self.instance
				@@instance ||= {}
				@@instance[self.class.to_s] ||= new
			end
			# rubocop:enable Style/ClassVars

			def redis
				@raw_redis ||= OVE::Storage::Driver.kv_instance.namespace self.class.to_s
			end

			def file_system
				OVE::Storage::Driver.fs_instance '/video'
			end
		end
	end
end
