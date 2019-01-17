require 'fileutils'
require 'tmpdir'
require_relative 'spec_helper'

describe OVE::Ingest::Thumbnail do

	# Skip this test suite if we don't have ffmpeg configured
	before(:each) {
		skip "Run again with the environmental variable DEBUG set to 1." unless ENV['DEBUG'] == '1'
	}

	context 'when given an input video' do
		@storage = nil
		@tmpdir = nil

		before(:all) do
			tmpdir = Dir.mktmpdir
			# Safety check: we have a real directory. We don't want to remove the whole tree if not.
			if File.exist? tmpdir 
				@tmpdir = tmpdir
			else
				raise "Could not create temporary directory!"
			end

			FileUtils.copy('./spec/resource/test.ts', tmpdir + '/test.ts')
		end

		after(:all) do
			FileUtils.remove_entry(@tmpdir) if @tmpdir != nil
		end

		def file_exists file
			File.exist?(@tmpdir + '/' + file)
		end

		def file_exists_and_not_empty file
			file_exists(file) and File.size(@tmpdir + '/' + file) > 0
		end

		it 'generates a thumbnail' do

			expect(file_exists('test.ts')).to eq(true)

			OVE::Ingest::Thumbnail.create(@tmpdir + '/test.ts')

			expect(file_exists_and_not_empty('test.ts.jpg')).to eq(true)

		end

	end
end
