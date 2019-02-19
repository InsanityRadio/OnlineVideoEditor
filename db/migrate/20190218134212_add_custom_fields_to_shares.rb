class AddCustomFieldsToShares < ActiveRecord::Migration[5.2]
	def change
		add_column :shares, :configuration, :text, :limit => 4294967295
	end
end
