#!/bin/env ruby
$LOAD_PATH << 'lib'

require 'yaml'
require 'ove'

class TestWorker < OVE::Worker::Render

	def initialize
	end

	def options
		{
			'video_id' => 4,
		}
	end

	def at a = nil, b = nil, c = nil
		p [a, b, c]
	end

end

TestWorker.new.perform