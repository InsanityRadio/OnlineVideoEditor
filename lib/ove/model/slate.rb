module OVE
	module Model
		class Slate < ActiveRecord::Base
			belongs_to :user
		end
	end
end