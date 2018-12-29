#!/bin/env ruby
$LOAD_PATH << 'lib'

require 'ove'

my_services = OVE::Ingest::SourceProvider.instance.sources

loop do
	my_services.each(&:index)
	sleep 1
end
