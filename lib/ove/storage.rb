module OVE
	# Encapsulates all (key-value) storage systems
	module Storage
	end
end

require_relative './storage/base'
require_relative './storage/cue_points'
require_relative './storage/driver'
require_relative './storage/ingest'
require_relative './storage/import'
