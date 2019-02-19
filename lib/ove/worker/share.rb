module OVE
	module Worker
		# The Share worker uploads rendered content to social media platforms 
		class Share
			include Resque::Plugins::Status

			def perform
				share_id = options['share_id']

				share = OVE::Model::Share.find_by(id: share_id)

				begin

					raise "This share has already been published" if share.shared
					at(1, 100)

					publish_on = share.publish_on
					raise "This share can't be published this early" if publish_on != nil && publish_on > Time.now

					provider = OVE::Share::PlatformProvider.find share.platform.platform_type
					provider.upload(share, share.video.output_path)

					share.shared = true
					share.save

					at(100, 100)

				ensure
					share.queued = false
					share.save
				end
			end
		end
	end
end