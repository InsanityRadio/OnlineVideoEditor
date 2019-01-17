require 'securerandom'

module OVE
	module Service
		# 
		class Main < HTTPService

			configure do
				enable :sessions
				set :sessions,
					:key => 'ove.session.core',
					:httponly => true,
					:expire_after => 31557600,
					:secret => SecureRandom.hex
			end

			# /auth_request is used internally by nginx to control access to other backends.
			# For instance, a request to /ingest/video/import is 'filtered' through this method.
			# However, nginx handles running the request, as using Ruby would add unnecessary overhead

			get '/auth_request' do
				# verify the user is authenticated and able to make this backend request.

				# halt 403
				'OK'
			end

			# /bootstrap returns 
			get '/bootstrap' do
				begin
					# security mechanism here
				rescue StandardError
					session.clear
					send_json(
						authorized: false
					)
					return
				end

				session[:csrf_token] ||= SecureRandom.hex

				send_json(
					csrf_token: session[:csrf_token]
				)
			end

		end
	end
end
