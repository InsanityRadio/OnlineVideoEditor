require 'fakeredis'
require_relative 'spec_helper'

describe OVE::Ingest::Source do 

	class FakeStorage < OVE::Storage::Ingest

		def initialize
			# Override the namespace stuff for now as it's not necessary in-memory.
			@fake_redis = Redis.new
		end

		def store_chunk chunk
			super chunk
		end

		def delete_chunk chunk_path
			super chunk_path
		end

	end

	class FakeManifest < OVE::HLS::Manifest

		attr_accessor :chunks

		def initialize
			@target_duration = 5
			@version = 3
			@media_sequence = 0
		end

	end


	context 'when given several HLS chunks' do

		@storage = nil

		class StubbedSource < OVE::Ingest::Source

			attr_accessor :_test_manifest, :_test_storage, :_test_file_list

			private
			def get_hls_manifest
				# inject our stubbed manifest here
				@_test_manifest
			end

			def get_storage_engine
				# inject our stubbed storage engine here
				@_test_storage
			end

			def scan_directory
				@_test_file_list
			end

		end

		before(:context) do 

			@storage = FakeStorage.new

			@source = StubbedSource.new 'dummy', '/video'
			@source._test_storage = @storage
			@source._test_file_list = []

		end

		after(:context) do

			# Wipe Redis to ensure we have a clean test slate
			Redis.new.flushall
			@storage = nil

		end

		it 'starts correctly and indexes the initial files' do

			manifest = FakeManifest.new
			manifest.chunks = [
				OVE::HLS::Chunk.new(manifest, 1, 5.0, 'dummy-0.ts', nil),
				OVE::HLS::Chunk.new(manifest, 2, 5.0, 'dummy-5.ts', nil),
				OVE::HLS::Chunk.new(manifest, 3, 5.0, 'dummy-10.ts', nil),
				OVE::HLS::Chunk.new(manifest, 4, 5.0, 'dummy-15.ts', nil)
			]

			@source._test_manifest = manifest
			@source._test_file_list = ['dummy-0.ts', 'dummy-5.ts', 'dummy-10.ts', 'dummy-15.ts']
			@source.index

			stored_chunk_list = @source.get_all_chunk_paths

			expect(stored_chunk_list).to eq(@source._test_file_list)

		end

		it 'indexes new files as they appear' do

			manifest = FakeManifest.new
			manifest.chunks = [
				OVE::HLS::Chunk.new(manifest, 1, 5.0, 'dummy-0.ts', nil),
				OVE::HLS::Chunk.new(manifest, 2, 5.0, 'dummy-5.ts', nil),
				OVE::HLS::Chunk.new(manifest, 3, 5.0, 'dummy-10.ts', nil),
				OVE::HLS::Chunk.new(manifest, 4, 5.0, 'dummy-15.ts', nil),
				OVE::HLS::Chunk.new(manifest, 5, 5.0, 'dummy-20.ts', nil)
			]

			@source._test_manifest = manifest
			@source._test_file_list = [
				'dummy-0.ts',
				'dummy-5.ts',
				'dummy-10.ts',
				'dummy-15.ts',
				'dummy-20.ts'
			]

			@source.index

			stored_chunk_list = @source.get_all_chunk_paths

			expect(stored_chunk_list).to eq(@source._test_file_list)

		end

		it 'deletes old files as they disappear' do

			manifest = FakeManifest.new
			manifest.chunks = [
				OVE::HLS::Chunk.new(manifest, 2, 5.0, 'dummy-5.ts', nil),
				OVE::HLS::Chunk.new(manifest, 3, 5.0, 'dummy-10.ts', nil),
				OVE::HLS::Chunk.new(manifest, 4, 5.0, 'dummy-15.ts', nil),
				OVE::HLS::Chunk.new(manifest, 5, 5.0, 'dummy-20.ts', nil)
			]

			@source._test_manifest = manifest
			@source._test_file_list = [
				'dummy-5.ts',
				'dummy-10.ts',
				'dummy-15.ts',
				'dummy-20.ts'
			]

			@source.index

			stored_chunk_list = @source.get_all_chunk_paths

			expect(stored_chunk_list).to eq(@source._test_file_list)

		end

		it 'works when there is no video (for instance, if stalled)' do

			manifest = FakeManifest.new
			manifest.chunks = []

			@source._test_manifest = manifest
			@source._test_file_list = []

			@source.index

			stored_chunk_list = @source.get_all_chunk_paths

			expect(stored_chunk_list).to eq(@source._test_file_list)

		end

	end

end
