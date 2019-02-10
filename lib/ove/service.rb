module OVE
	# Encapsulates all of the HTTP server interfaces, and all Sinatra-related code
	module Service
	end
end

require_relative './service/http_service'
require_relative './service/ingest'
require_relative './service/import'
require_relative './service/main'
require_relative './service/slate'
