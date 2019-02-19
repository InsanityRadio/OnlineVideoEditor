class AddLockToShareTable < ActiveRecord::Migration[5.2]
	def change
		add_column :shares, :queued, :boolean, default: false
	end
end
