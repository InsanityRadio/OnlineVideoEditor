module OVE
	module Model
		class Video < ActiveRecord::Base
			belongs_to :user
			belongs_to :import
			has_many :shares

			validates :video_type, inclusion: {:in => ['default', 'slate', 'frame']}

			def to_h
				{
					id: id,
					created_by: user.id,
					type: video_type,
					configuration: configuration,
					queued: queued,
					rendered: rendered,
					shares: shares.map(&:to_h)
				}
			end

			def add_output temporary_path
				new_path = $config['render']['scratch'] + '/render_' + id.to_s + '.mp4'

				FileUtils.copy(temporary_path, new_path)
				
				write_attribute :output_path, new_path
				write_attribute :output_expiry, Time.now.to_i + $config['render']['expiry']
				write_attribute :rendered, true
			end

			before_destroy :delete_files

			def delete_files
				File.unlink(output_path) rescue nil
				write_attribute :output_path, ''
			end
		end
	end
end