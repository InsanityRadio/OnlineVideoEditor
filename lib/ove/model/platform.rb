module OVE
	module Model
		class Platform < ActiveRecord::Base
			has_many :shares

			validates :platform_type, inclusion: {:in => ['facebook', 'youtube', 'twitter', 'instagram']}

			def to_h
				{
					id: id,
					name: name,
					default_share_text: default_share_text,
					platform_type: platform_type,
					configuration: configuration
				}
			end

			# Depending on platform_type, we should ensure that the user-entered settings are valid.
			# This might mean taking a client-side token and converting it to a server-side token of indefinite length
			def validate_connection
				provider = OVE::Share::PlatformProvider.find platform_type
				provider.validate(self)
			end
		end
	end
end