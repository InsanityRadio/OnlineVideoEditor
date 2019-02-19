module OVE
	module Share
		class PlatformProvider
			def self.find platform_type
				case platform_type
				when 'facebook'
					OVE::Share::Facebook
				else
					raise 'Unknown platform specified.'
				end
			end
		end
	end
end