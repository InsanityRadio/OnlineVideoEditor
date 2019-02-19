require 'resque'
require 'resque-status'

module OVE
	# Encapsulates all of the HTTP server interfaces, and all Sinatra-related code
	module Worker
	end
end

Resque.redis = ENV['REDIS'] if ENV['REDIS'] != nil

require_relative './worker/render'
require_relative './worker/share'
