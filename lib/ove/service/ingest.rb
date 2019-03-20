require 'securerandom'

module OVE
	module Service
		# The main interface to externally access the ingest engine. Outside of this class, ingest
		#  should not be referenced/used in code. 
		class Ingest < HTTPService
			enable :sessions

			# sSet DEBUG=1 in your environment and this code will be included.
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

				my_sources = OVE::Ingest::SourceProvider.instance.sources

				services = my_sources.map do |s|
					{
						service: s.service,
						start_time: s.start_time / 1000.0,
						end_time: s.end_time / 1000.0
					}
				end

				send_json(
					csrf_token: session[:csrf_token],
 					services: services
				)
			end

			get '/:service/preview.m3u8' do |service|
				start_time = params['start_time'].to_i
				end_time = params['end_time'].to_i

				# 1. get list of HLS chunks between start & end
				# 2. find the unique ID of each chunk
				# 3. Set the discontinuity to this ID
				# 4. Send a m3u8 file with that stuff

				my_sources = OVE::Ingest::SourceProvider.instance.sources
				source = my_sources.find { |s| s.service == service }

				halt 404 unless service

				content_type 'application/x-mpegURL'

				source.generate_hls start_time * 1000.0, end_time * 1000.0
			end

			get '/:service/download.mp4' do |service, id|
				start_time = params['start_time'].to_i
				end_time = params['end_time'].to_i

				my_sources = OVE::Ingest::SourceProvider.instance.sources
				source = my_sources.find { |s| s.service == service }

				halt 404 unless service

				out_path = nil

				begin

					out_path, stderr, wait_thr = import.generate_mp4 start_time * 1000.0, end_time * 1000.0

					halt 500 unless wait_thr.value.success?

					# Write headers to make file download easier.
					content_type 'video/mp4'
					response.header['Content-Length'] = File.size(out_path)

					file = File.open(out_path, 'rb')

					# We can't use send_file here, as it will be garbage collected before the call ends
					stream do | out |
						until file.closed? or out.closed?
							data = file.read(4096)
							break if data == nil

							out << data
						end
						file.close rescue nil
						out.close rescue nil
					end

				ensure
					File.unlink(out_path) if out_path != nil
				end
			end

			get '/:service/cue_points' do
				points = OVE::Storage::CuePoints.instance.points

				points = points.map {|p| JSON.parse(p)}

				send_json(
					success: 1,
					points: points
				)
			end

			# Creates a "cue point" - a useful segment of video
			post '/:service/cue_points' do |service|

				my_sources = OVE::Ingest::SourceProvider.instance.sources
				source = my_sources.find { |s| s.service == service }

				halt 404 unless service

				start_time, end_time = params['start_time'].to_i, params['end_time'].to_i

				if (end_time - start_time) < 5
					send_json(
						success: 0,
						error: "Cue points must be longer than 5 seconds in duration."
					)
					next
				end

				cue_point = OVE::Ingest::CuePoint.new start_time, end_time, service
				cue_point.save

			end
		end
	end
end
