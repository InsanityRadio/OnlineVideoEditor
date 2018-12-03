module OVE
	# This module contains classes that can handle HLS manifests and chunks at a low level.
	module HLS
	end
end

require_relative './hls/manifest'
require_relative './hls/manifest_parser'
require_relative './hls/manifest_generator'
require_relative './hls/chunk'
require_relative './hls/chunk_list'
