#!/bin/env ruby
$LOAD_PATH << 'lib'

require 'ove'

my_services = OVE::Ingest::SourceProvider.instance.get_sources

loop do
	my_services.each(&:index)
	sleep 1
end
