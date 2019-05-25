require 'fakeredis'
require_relative 'spec_helper'

describe OVE::Import::Import do
	class FakeDiskStorage < OVE::Storage::Import
		attr_accessor :_test_storage

		def initialize
			# Override the namespace stuff for now as it's not necessary in-memory.
			@fake_redis = Redis.new
			@chunks = {}
		end

		def store_file uuid, chunk_path
			@chunks[uuid] ||= {}
			@chunks[uuid][:chunks] ||= []
			@chunks[uuid][:chunks] << chunk_path
		end

		def store_metadata uuid, data
			@chunks[uuid] ||= {}
			@chunks[uuid][:data] = data
		end

		def find_metadata uuid
			return @chunks[uuid][:data]
		end

		def find_files uuid
			@chunks[uuid][:chunks]
		end

		def find_categories
			@chunks.keys
		end

		def delete_category uuid
			@chunks.delete uuid
		end

		def find_expiry uuid
			Time.now.to_i + 10
		end

		def resolve category, file, full = false
			(full ? '/' : '') + category + '/' + file
		end

		 private

		def storage_engine
			@_test_storage
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

	context 'when given a valid start and end time' do
		@storage = nil

		class StubbedImport < OVE::Import::Import
			attr_accessor :_test_storage

			 private

			def storage_engine source
				# inject our stubbed storage engine here
				@_test_storage
			end
		end

		before(:context) do
			@storage = FakeStorage.new

			@disk_storage = FakeDiskStorage.new
			@disk_storage._test_storage = @disk_storage

			@source = StubbedSource.new 'dummy', '/video'
			@source._test_storage = @storage

			@importer = StubbedImport.new
			@importer._test_storage = @disk_storage
		end

		after(:context) do
			#  Wipe Redis to ensure we have a clean test slate
			Redis.new.flushall
			@storage = nil
		end

		it 'correctly imports chunks' do
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

			imported = @importer.import @source, 7.000, 18.000

			expect(imported.chunks.length).to eq(3)
			expect(imported.chunks[0].path).to eq('dummy-5.ts')

			expect(@importer.find_by_source(@source).length).to eq(1)

			# Test that it deletes just fine
			@importer.delete @source, imported
			expect(@importer.find_by_source(@source).length).to eq(0)
		end
	end
end
