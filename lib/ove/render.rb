module OVE
	# Encapsulates all of the HTTP server interfaces, and all Sinatra-related code
	module Render
	end
end

require_relative './render/render_provider'
require_relative './render/base'
require_relative './render/downloader'
require_relative './render/engine'
require_relative './render/frame'
require_relative './render/slate'
require_relative './render/temp_file_manager'
