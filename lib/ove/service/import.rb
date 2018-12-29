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
					id: data[:uuid],
					data: data
				)
			end
		end
	end
end
