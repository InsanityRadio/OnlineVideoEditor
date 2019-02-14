class UpdatePlatformCol < ActiveRecord::Migration[5.2]
	def change
		remove_column :shares, :platform
		add_reference :shares, :platform, index: true
	end
end
