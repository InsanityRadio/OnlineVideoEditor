require 'fileutils'
require 'tmpdir'
require_relative 'spec_helper'

describe OVE::Storage::Driver::FileSystem do
	context 'when run on a target directory' do
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
		end

		after(:all) do
			FileUtils.remove_entry(@tmpdir) if @tmpdir != nil
		end

		before(:each) do
			@storage = OVE::Storage::Driver.fs_instance(@tmpdir)
		end

		def generate_file file, contents
			FileUtils.chdir(@tmpdir) do
				File.write(file, contents)
			end
			file
		end

		def delete_file file
			FileUtils.chdir(@tmpdir) do
				File.unlink(file)
			end
		end

		def file_exists file
			File.exist?(@tmpdir + '/' + file)
		end

		def file_read file
			File.read(@tmpdir + '/' + file)
		end

		it 'can correctly store temporary files after their deletion' do
			file_path = generate_file('test.ts', test_string = 'test string')

			path = @storage.store_file 'category', file_path

			delete_file file_path

			expect(file_exists(path)).to eq(true)
			expect(file_read(path)).to eq(test_string)
		end

		it 'can correctly clean up expired directories' do
			file_path = generate_file('test.ts', test_string = 'test string')

			path_safe = @storage.store_file 'category', file_path
			path_unsafe = @storage.store_file 'category2', file_path, -1

			delete_file file_path

			@storage.clean!

			expect(file_exists(path_safe)).to eq(true)
			expect(file_exists(path_unsafe)).to eq(false)
		end

	end
end
