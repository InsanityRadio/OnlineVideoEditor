require 'net/http'
require 'uri'

module OVE
	module Render
		class Downloader
			def initialize url, target
				@url = URI.parse url

				Net::HTTP.new(url.host, url.port).request_get(url.path) do |response|
					length = thread[:length] = response['Content-Length'].to_i

					file = File.open(target, 'wb')
					progress = 0, length = response['Content-Length'].to_i

					response.read_body do |fragment|
						file.write fragment
						progress += fragment.length
						yield 100 * progress / length
					end
					file.close
				end				
			end
		end
	end
end