$LOAD_PATH << './'

# Defines the main project namespace
module OVE
end

require_relative './ove/server'
require_relative './ove/service'
require_relative './ove/ingest'
require_relative './ove/hls'
require_relative './ove/storage'
require_relative './ove/import'
require_relative './ove/transmux'