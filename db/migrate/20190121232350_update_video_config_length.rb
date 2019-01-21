class UpdateVideoConfigLength < ActiveRecord::Migration[5.2]
	def change
		change_column :videos, :configuration, :text, :limit => 4294967295
	end
end
