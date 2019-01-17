module OVE
	module Model
		class Video < ActiveRecord::Base
			belongs_to :user
			belongs_to :import
			has_many :shares

			validates :video_type, inclusion: {:in => ['default', 'slate', 'frame']}

			def to_h
				{
					id: id,
					created_by: user.id,
					type: video_type,
					configuration: configuration,
					queued: queued,
					rendered: rendered,
					shares: shares.map(&:to_h)
				}
			end
		end
	end
end