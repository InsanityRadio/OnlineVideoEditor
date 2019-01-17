require 'sinatra/activerecord'
require 'sinatra'

if ENV['RACK_DB_NAME']
	set :database, {
		adapter: "mysql2",
		encoding: "utf8",
		reconnect: true,
		host: (ENV['RACK_DB_HOST'] or 'localhost'),
		port: (ENV['RACK_DB_PORT'].to_i or 3306),
		database: ENV['RACK_DB_NAME'],
		username: (ENV['RACK_DB_USER'] or 'root'),
		password: (ENV['RACK_DB_PASS'] or '')
	}
end

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
