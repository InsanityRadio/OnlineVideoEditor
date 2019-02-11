#!/bin/env ruby
$LOAD_PATH << 'lib'

require 'yaml'
require 'ove'

my_services = OVE::Ingest::SourceProvider.instance.sources

Thread.abort_on_exception = true

Thread.new do
	loop do
		my_services.each(&:thumbnail)
		sleep 1
	end
end

loop do
	my_services.each(&:index)
	sleep 1
end
