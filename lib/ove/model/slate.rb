module OVE
	module Model
		class Slate < ActiveRecord::Base
			belongs_to :user

			def to_h
				{
					created_by: user.id,
					id: id,
					name: name
				}
			end

			before_destroy :delete_files

			def set_path temporary_path
				new_path = $config['render']['scratch'] + '/slate_' + id.to_s + '.mp4'

				FileUtils.copy(temporary_path, new_path)
				OVE::Ingest::Thumbnail.create(new_path)

				write_attribute :path, new_path
				write_attribute :thumbnail_path, new_path + '.jpg'
			end

			def delete_files
				File.unlink(path) rescue nil
				File.unlink(thumbnail_path) rescue nil

				write_attribute :path, ''
				write_attribute :thumbnail_path, ''
			end
		end
	end
end