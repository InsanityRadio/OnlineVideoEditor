module OVE
	module Model
		class Share < ActiveRecord::Base
			belongs_to :user
			belongs_to :video
			belongs_to :platform

			delegate :import, to: :video, allow_nil: false

			def to_h
				{
					id: id,
					created_by: user.id,
					platform: platform.to_h,
					title: title,
					description: description,
					publish_on: publish_on,
					shared: shared
				}
			end
		end
	end
end