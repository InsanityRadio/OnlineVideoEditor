require 'securerandom'
require 'sinatra/streaming'

module OVE
	module Service
		# 
		class Import < HTTPService
			enable :sessions

			configure do
				use Rack::Session::Cookie,
					:key => 'ove.session.ingest',
					:httponly => true,
					:expire_after => 31557600,
					:secret => SecureRandom.hex
			end

			get '/test' do
				'test'
			end

			post '/:service/import' do |service|
				start_time = params['start_time'].to_f
				end_time = params['end_time'].to_f

				# 1. Get a list of HLS chunks between start and end
				# 2. Generate a unique ID for the category name
				# 3. Store the HLS chunks persistently under that chunk ID
				# 4. Return.

				my_sources = OVE::Ingest::SourceProvider.instance.sources
				source = my_sources.find { |s| s.service == service }

				halt 404 unless service

				importer = OVE::Import::Import.instance
				data = importer.import source, start_time * 1000.0, end_time * 1000.0

				send_json(
					success: 1,
					id: data.uuid,
					data: data.serialize(false)
				)
			end

			# Load a list of all imports on the system
			get '/imports' do
				# todo
			end

			# Load a list of imports under a given service
			get '/:service/imports' do |service|
				my_sources = OVE::Ingest::SourceProvider.instance.sources
				source = my_sources.find { |s| s.service == service }

				halt 404 unless service

				importer = OVE::Import::Import.instance
				imports = importer.find_by_source source

				imports = imports.map do |import|
					import = import.serialize false
					import.delete :chunk_data
					import
				end

				send_json(
					success: 1,
					imports: imports
				)
			end

			# Expand details on a given import
			get '/:service/import/:id' do |service, id|
				my_sources = OVE::Ingest::SourceProvider.instance.sources
				source = my_sources.find { |s| s.service == service }

				halt 404 unless service

				importer = OVE::Import::Import.instance
				import = importer.find_by_id source, id

				halt 404 unless import

				import = import.serialize(false)
				import.delete :chunk_data

				send_json(
					success: 1,
					import: import
				)
			end

			post '/:service/import/:id/delete' do |service, uuid|
				authorize!
				user_id = session[:user_id]

				my_sources = OVE::Ingest::SourceProvider.instance.sources
				source = my_sources.find { |s| s.service == service }

				halt 404 unless service

				importer = OVE::Import::Import.instance
				import = importer.find_by_id source, id

				importer.delete service, import

				send_json(
					success: 1
				)			
			end

			# Generate a HLS manifest for the imported video
			get '/:service/import/:id/preview.m3u8' do |service, id|
				my_sources = OVE::Ingest::SourceProvider.instance.sources
				source = my_sources.find { |s| s.service == service }

				halt 404 unless service

				importer = OVE::Import::Import.instance
				import = importer.find_by_id source, id

				halt 404 unless import

				content_type 'application/x-mpegURL'

				import.generate_hls
			end


			get '/:service/import/:id/preview.jpg' do |service, id|
				my_sources = OVE::Ingest::SourceProvider.instance.sources
				source = my_sources.find { |s| s.service == service }

				halt 404 unless service

				importer = OVE::Import::Import.instance
				import = importer.find_by_id source, id

				halt 404 unless import

				send_file(import.thumbnail_path, :disposition => 'inline', :filename => 'thumbnail.jpg')
			end

			get '/:service/import/:id/download.mp4' do |service, id|
				my_sources = OVE::Ingest::SourceProvider.instance.sources
				source = my_sources.find { |s| s.service == service }

				halt 404 unless service

				importer = OVE::Import::Import.instance
				import = importer.find_by_id source, id

				halt 404 unless import

				out_path = nil

				begin

					out_path, stderr, wait_thr = import.generate_mp4

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

		end
	end
end
