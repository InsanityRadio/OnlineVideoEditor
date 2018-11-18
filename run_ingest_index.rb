#!/bin/env ruby
$: << 'lib'

require 'ove'

my_services = OVE::Ingest::SourceProvider.instance.get_sources

loop do 

	my_services.each { | service | service.index }

end