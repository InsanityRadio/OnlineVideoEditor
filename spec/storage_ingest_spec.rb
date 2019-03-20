require 'fakeredis'
require_relative 'spec_helper'

describe OVE::Storage::Ingest do
	class MemoryStorage < OVE::Storage::Ingest
		def initialize
			# Override the namespace stuff for now as it's not necessary in-memory.
			@fake_redis = Redis.new
		end
	end

	context 'when given several HLS chunks' do
		@storage = nil

		before(:each) do
			@storage = MemoryStorage.new
		end

		after(:each) do
			#  Wipe Redis to ensure we have a clean test slate
			Redis.new.flushdb
			@storage = nil
		end

		it 'can correctly store these' do
			dummy_hls = <<~MANIFEST
				#EXTM3U
				#EXT-X-VERSION:3
				#EXT-X-MEDIA-SEQUENCE:9621
				#EXT-X-TARGETDURATION:10

				#EXTINF:5.108,
				2.9621.ts
			MANIFEST

			manifest = OVE::HLS::Manifest.from dummy_hls
			chunks = manifest.chunks
			@storage.store_chunk chunks[0]

			redis_chunks = @storage.chunks

			expect(redis_chunks.length).to eq(1)

			redis_chunk = @storage.find_chunk redis_chunks[0]
			expect(redis_chunk.length).to eq(5.108)
			expect(redis_chunk.path).to eq('2.9621.ts')
			expect(redis_chunk.chunk_id).to eq(9621)
		end

		it 'correctly determines GIDs' do
			dummy_hls = <<~MANIFEST
				#EXTM3U
				#EXT-X-VERSION:3
				#EXT-X-MEDIA-SEQUENCE:9621
				#EXT-X-TARGETDURATION:10

				#EXTINF:5.108,
				2.9621.ts
				#EXTINF:5.108,
				2.9622.ts
				#EXTINF:5.108,
				2.9623.ts
				#EXTINF:5.062,
				2.9624.ts
				#EXTINF:5.108,
				2.9625.ts
				#EXTINF:5.108,
				2.9626.ts
			MANIFEST

			manifest = OVE::HLS::Manifest.from dummy_hls
			manifest.chunks.each { |c| @storage.store_chunk c }

			redis_chunks = @storage.chunks
			redis_full_chunks = redis_chunks.map { |path| @storage.find_chunk path }

			expect(redis_chunks.length).to eq(6)

			# Skipping [0], compare each chunk with the previous to make sure the GIDs are sequential
			previous = redis_full_chunks[0]
			redis_full_chunks[1..-1].each do |current|
				expect(current.gid).to eq(previous.gid + 1)

				previous = current
			end
		end

		it 'correctly determines GIDs when some entries are skipped' do
		end

		it 'correctly determines GIDs from sequential IDs when the manifest truncated our last available entry' do
			dummy_hls = <<~MANIFEST
				#EXTM3U
				#EXT-X-VERSION:3
				#EXT-X-MEDIA-SEQUENCE:9621
				#EXT-X-TARGETDURATION:10

				#EXTINF:5.108,
				2.9621.ts
				#EXTINF:5.108,
				2.9622.ts
				#EXTINF:5.108,
				2.9623.ts
				#EXTINF:5.062,
				2.9624.ts
				#EXTINF:5.108,
				2.9625.ts
				#EXTINF:5.108,
				2.9626.ts
			MANIFEST

			manifest = OVE::HLS::Manifest.from dummy_hls

			#  Store first 2 chunks
			manifest.chunks[0..1].each { |c| @storage.store_chunk c }

			@storage.store_chunk manifest.chunks[5]

			redis_chunks = @storage.chunks
			redis_full_chunks = redis_chunks.map { |path| @storage.find_chunk path }

			# Are we in a good place? Sanity check the env.
			expect(redis_chunks.length).to eq(3)

			first_gid = redis_full_chunks[0].gid

			expect(redis_full_chunks[1].gid).to eq(first_gid + 1)

			# The last secret chunk we added should result in a gap of 3 places in our storage engine
			# We can't know if these exist or not, so assume they do not exist (downtime, etc)
			expect(redis_full_chunks[2].gid).to eq(first_gid + 5)
		end
	end
end
