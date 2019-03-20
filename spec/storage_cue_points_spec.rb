require 'fakeredis'
require_relative 'spec_helper'

describe OVE::Storage::Ingest do
	class CueMemoryStorage < OVE::Storage::CuePoints
		def initialize
			# Override the namespace stuff for now as it's not necessary in-memory.
			@fake_redis = Redis.new
		end
	end

	class MemoryCuePoint < OVE::Ingest::CuePoint
		def storage_engine
			CueMemoryStorage.instance
		end
	end

	context 'when given some start/end cue times' do
		@storage = nil

		before(:each) do
			@storage = CueMemoryStorage.new
		end

		after(:each) do
			#  Wipe Redis to ensure we have a clean test slate
			Redis.new.flushdb
			@storage = nil
		end

		it 'can correctly store a list of points' do
			cue_times = [
				[1, 2],
				[4, 5]
			]

			cue_points = cue_times.map {|time| MemoryCuePoint.new('video', time[0], time[1]) }
			cue_points.each &:save

			points = @storage.points

			expect(points.length).to eq(2)
			expect(points[0].start_time).to eq(1)
			expect(points[0].end_time).to eq(2)
			expect(points[0].service).to eq('video')

			expect(points[1].start_time).to eq(4)
			expect(points[1].end_time).to eq(5)
			expect(points[1].service).to eq('video')
		end

		it 'can correctly clean up old points' do

			cue_times = [
				[1, 2],
				[2, 3],
				[4, 5]
			]

			cue_points = cue_times.map {|time| MemoryCuePoint.new('video', time[0], time[1]) }
			cue_points.each &:save

			@storage.clean_points(3)

			points = @storage.points

			expect(points.length).to eq(1)
			expect(points[0].start_time).to eq(4)
			expect(points[0].end_time).to eq(5)
			expect(points[0].service).to eq('video')
		end
	end
end
