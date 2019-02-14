module OVE
	module Model
		class Platform < ActiveRecord::Base
			has_many :shares

			def to_h
				{
					id: id,
					name: name,
					default_share_text: default_share_text,
					platform_type: platform_type,
					configuration: configuration
				}
			end
		end
	end
end