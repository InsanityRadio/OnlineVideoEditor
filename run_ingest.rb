#!/bin/env ruby
$: << 'lib'

require 'rack'
require 'ove'

class Application < Sinatra::Application

	use OVE::Service::Ingest

	if ENV['DEBUG'] == '1'
		use OVE::Service::Ingest::Test
	end

end

RunIngest = Rack::Builder.new do

	app = Application.new 

	run app

end.to_app

