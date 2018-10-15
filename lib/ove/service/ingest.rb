require 'securerandom'

module OVE
	module Service
		class Ingest < HTTPService

			get '/bootstrap' do 

				session[:csrf_token] ||= SecureRandom.hex

				my_services = OVE::Ingest.SourceProvider.instance.get_sources

				send_json(

					csrf_token: session[:csrf_token],

					services: my_services.map( { |s| 

						{
							service: s.service,
							start_time: s.start_time,
							end_time: s.end_time
						}

					})

				)

			end

		end
	end
end