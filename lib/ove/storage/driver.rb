require 'fileutils'
require 'redis'
require 'redis-namespace'

module OVE
	module Storage
		# The storage driver mediates access to databases, except ActiveRecord.
		class Driver
			# Provides a driver to access a key-value store (Redis), handling namespacing.
			class KeyValue
				def initialize
					@raw_redis = Redis.new reconnect_attempts: 99_999, url: ENV['REDIS']
					@redis = Redis::Namespace.new :ove, redis: @raw_redis
				end

				# Get a given namespace Redis for a module
				def namespace(name)
					Redis::Namespace.new "ove_#{name}".to_sym, redis: @raw_redis
				end

				private

				def method_missing(method, *args, &block)
					@redis.send method, *args, &block
				end
			end

			# Provides a driver to persistently store 
			class FileSystem
				def initialize root
					@root = root
				end

				# Stores a file (using a hard link) with a given category
				# @param category [String] A category name, which should be a valid UNIX file name
				# @param file [String] The file name to persistently store under this category.
				# @param time_to_live [Integer] Seconds until this category is considered stale
				def store_file category, file, time_to_live = 1209600
					path = resolve(category, file)
					FileUtils.cd(@root) do
						FileUtils.mkdir_p(category)
						begin
							FileUtils.ln(file, path)
						rescue Errno::EEXIST
						end

						# Write a (fresh) expiry date to this category. Defaults to
						File.write(resolve(category, 'expires.dat'), Time.now.to_i + time_to_live)
					end
					path
				end

				def store_metadata category, data = {}
					file = 'data.json'
					path = resolve(category, file)

					FileUtils.cd(@root) do
						FileUtils.mkdir_p(category)

						File.write(path, data.to_json)
					end
					path
				end

				# Return the path on disk of the file given its storage key, or nil if it doesn't exist
				def find_file category, file
					file_path = @root + '/' + resolve(category, file)
					File.exist?(file_path) ? file_path : nil
				end

				# Deletes the file as specified, and its category if it is now empty.
				def delete_file category, file
					FileUtils.cd(@root) do
						path = resolve(category, file)
						raise "Invalid path" if File.directory? path
						FileUtils.remove_entry_secure(path)
						FileUtils.rmdir(category) if Dir.empty?(category)
					end
				end

				def find_categories
					FileUtils.cd(@root) do
						return Dir.glob('**/').select { |category|
							File.exist?(resolve(category, 'expires.dat'))
						}.map { |category| category.tr '/', '' }
					end
				end

				# Return a list of files 
				def find_files category
					file_path = @root + '/' + resolve(category, '*')
					Dir.glob(file_path)
				end

				# Return the metadata we're storing against this category
				def find_metadata category
					file_path = @root + '/' + resolve(category, 'data.json')
					begin
						File.exist?(file_path) ? JSON.parse(File.read(file_path), symbolize_names: true) : nil
					rescue JSON::ParserError
						nil
					end
				end

				def find_expiry category
					FileUtils.cd(@root) do
						path = resolve(category, 'expires.dat')

						return false if !File.exist?(path)

						return File.read(path).to_i 
					end
				end

				# Deletes an entire category. May be useful for cleaning up.
				def delete_category category
					FileUtils.cd(@root) do
						path = resolve(category, '')
						FileUtils.remove_entry_secure(path)
					end
				end

				# Find each category directory and delete anything that has an expired TTL
				def clean!
					FileUtils.cd(@root) do
						Dir.glob('**/').each do |category|
							category = category.chomp '/'
							expiry_dat = resolve(category, 'expires.dat')
							next if !File.exist?(expiry_dat)
							expiry = File.read(expiry_dat).to_i 
							delete_category category if expiry < Time.now.to_i
						end
					end
				end

				def resolve category, file
					raise "Invalid category name specified" unless category.match /[a-zA-Z0-9\_\-]+/
					category + '/' + file
				end

			end

			# We need to disable class variable checking to use singleton methods correctly.
			# rubocop:disable Style/ClassVars
			def self.kv_instance
				@@kv_instance ||= KeyValue.new
			end

			# Return an instance of the File System instance of the storage driver
			def self.fs_instance root
				@@fs_instance ||= {}
				@@fs_instance[root] ||= FileSystem.new(root)
			end
			# rubocop:enable Style/ClassVars
		end
	end
end
