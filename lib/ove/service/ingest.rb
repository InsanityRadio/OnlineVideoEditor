require 'securerandom'

module OVE
	module Service
		class Ingest < HTTPService

			enable :sessions

			# Set DEBUG=1 in your environment and this code will be included. 
			class Test < HTTPService

				# Render the "proof of concept" video player. 
				# This allows us to test the functionality of the video ingest/preview system independently. 
				get '/test_ingest' do

					content_type 'text/html'
					body File.read(File.join(File.dirname(__FILE__), '../res/test_ingest.html'))

				end

			end

			# Return 
			get '/bootstrap' do 

				session[:csrf_token] ||= SecureRandom.hex

				my_services = OVE::Ingest::SourceProvider.instance.get_sources

				send_json(

					csrf_token: session[:csrf_token],

					services: my_services.map { |s| 

						{
							service: s.service,
							start_time: s.start_time,
							end_time: s.end_time
						}

					}

				)

			end

			# 
			get '/preview?start_time=:start_time&end_time=:end_time' do | start_time, end_time |



			end

		end
	end
end