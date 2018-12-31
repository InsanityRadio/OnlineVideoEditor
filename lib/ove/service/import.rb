require 'securerandom'

module OVE
	module Service
		# 
		class Import < HTTPService
			enable :sessions

			get '/test' do
				'test'
			end

			post '/:service/import' do |service|
				start_time = params['start_time'].to_i
				end_time = params['end_time'].to_i

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
					data: data.serialize
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

		end
	end
end
