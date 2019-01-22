#!/bin/env ruby
$LOAD_PATH << 'lib'

require 'rack'
require 'yaml'
$config = YAML::load(File.read('./config.yml'))

require 'ove'

# This 'picks' the services that we want to expose/enable
class Application < Sinatra::Application
	use OVE::Service::Main
end

RunMain = Rack::Builder.new do
	app = Application.new
	run app
end.to_app
