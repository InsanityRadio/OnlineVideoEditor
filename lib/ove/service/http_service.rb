require 'sinatra/activerecord'
require 'sinatra'

module OVE
	module Service
		# The base class upon which all HTTP services can be constructed.
		# This is tightly coupled to Sinatra (which is sufficiently abstract), but provides a few
		#  custom helper methods to prevent code repetition
		class HTTPService < Sinatra::Application
			# Sends a hash as a JSON response with an optional HTTP status code.
			def send_json(data, code = 200)
				content_type 'application/json'
				status code
				body data.to_json
			end
		end
	end
end
