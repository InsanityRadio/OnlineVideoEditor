class AddSlateThumbnail < ActiveRecord::Migration[5.2]
	def change
		add_column :slates, :thumbnail_path, :string
	end
end
