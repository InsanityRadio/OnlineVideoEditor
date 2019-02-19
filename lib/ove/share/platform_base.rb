require 'json'
require 'koala'

module OVE
	module Share
		class PlatformBase

			# Uploads content given a share and a media path
			def self.upload share, video_path, &progress_block
				self.new share, video_path, &progress_block
			end

			# Takes a platform and ensures that it can be accessed (through API call). 
			def self.validate
			end

			def initialize share, video_path, &progress_block
				@progress_block = progress_block
				@configuration = JSON.parse(share.platform.configuration)

				connect_to_api
				upload! video_path, share.title, share.description
			end

			def connect_to_api
			end

			def upload! video_path, title, description
			end
		end
	end
end