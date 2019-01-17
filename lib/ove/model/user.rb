module OVE
	module Model
		class User < ActiveRecord::Base
			has_many :imports
			has_many :videos
			has_many :shares
		end
	end
end