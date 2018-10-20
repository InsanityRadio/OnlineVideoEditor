#!/bin/env ruby
$: << 'lib'

require 'rack'
require 'ove'

class Application < Sinatra::Application

	use OVE::Service::Ingest

end

RunIngest = Rack::Builder.new do

	app = Application.new 

	run app

end.to_app

