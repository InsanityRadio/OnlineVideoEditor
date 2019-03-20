require 'json'
require 'open-uri'
require 'koala'

if $config['share']['facebook'] != nil
	Koala.configure do |config|
		fb = $config['share']['facebook']
		config.app_access_token = fb['app_access_token']
		config.app_id = fb['app_id']
		config.app_secret = fb['app_secret']
	end
end

module OVE
	module Share
		class Facebook < PlatformBase
			def self.validate platform
				self.extend_credentials platform
			end

			def connect_to_api
				@fb = Koala::Facebook::API.new @configuration['page_access_token']
			end

			# Extends the short-lived OAuth access token to last for at least 60 days instead of 12h
			def self.extend_credentials platform
				config = JSON.parse(platform.configuration)
				app_config = $config['share']['facebook']

				url = 'https://graph.facebook.com/oauth/access_token?' \
					+ 'grant_type=fb_exchange_token&' \
					+ "client_id=#{app_config['app_id']}&" \
					+ "client_secret=#{app_config['app_secret']}&" \
					+ "fb_exchange_token=#{config['user_access_token']}"

				data = JSON.parse(open(url).read)

				user_access_token = data['access_token']

				# Connect to FB API with the long-lived token.
				# This allows us to get a long-lived page token.
				fb = Koala::Facebook::API.new user_access_token

				pages = fb.get_object('me/accounts')
				page = pages.find {|page| page['id'].to_i == config['page_id'].to_i}
				raise "Could not locate target page: #{config['page_id']}" if page == nil

				config['user_access_token'] = user_access_token
				config['page_access_token'] = page['access_token']

				# Save the new configuration!
				platform.configuration = config.to_json
				platform.save
			end

			def upload! video_path, title, description
				puts 'uploading video'

				page_id = @configuration['page_id']
				@fb.put_video video_path, { :title => title, :description => description }, page_id
				puts 'uploaded video'
			end

		end
	end
end