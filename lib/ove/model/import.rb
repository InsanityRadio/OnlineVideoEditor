module OVE
	module Model
		class Import < ActiveRecord::Base
			belongs_to :user
			has_many :videos

			def to_h
				{
					created_by: user.id,
					uuid: uuid,
					service: service,
					title: title,
					videos: videos.map(&:to_h)
				}
			end
		end
	end
end