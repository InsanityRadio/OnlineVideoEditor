$LOAD_PATH << 'lib'

require 'ove'
require 'sinatra/activerecord/rake'
require 'resque'
require 'resque/tasks'

Resque.redis = ENV['REDIS'] if ENV['REDIS'] != nil
