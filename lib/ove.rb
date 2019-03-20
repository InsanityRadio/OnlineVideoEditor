$LOAD_PATH << './'

require 'yaml'
$config = YAML::load(File.read('./config.yml'))

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
require_relative './ove/model'
require_relative './ove/render'
require_relative './ove/share'
require_relative './ove/worker'
