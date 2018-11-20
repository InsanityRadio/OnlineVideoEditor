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

				my_sources = OVE::Ingest::SourceProvider.instance.get_sources

				send_json(

					csrf_token: session[:csrf_token],

					services: my_sources.map { |s| 

						{
							service: s.service,
							start_time: s.start_time,
							end_time: s.end_time
						}

					}

				)

			end

			# 
			get '/:service/preview.m3u8' do | service |

				start_time = params['start_time'].to_i
				end_time = params['end_time'].to_i

				# 1. get list of HLS chunks between start & end

				# 2. find the unique ID of each chunk

				# 3. Set the discontinuity to this ID

				# 4. Send a m3u8 file with that stuff

				my_sources = OVE::Ingest::SourceProvider.instance.get_sources

				source = my_sources.find { | s | s.service == service }

				halt 404 if !service 

				content_type 'application/x-mpegURL'

				source.generate_hls start_time, end_time

			end

		end
	end
end