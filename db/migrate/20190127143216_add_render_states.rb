class AddRenderStates < ActiveRecord::Migration[5.2]
	def change
		add_column :videos, :worker_id, :text
		add_column :videos, :output_path, :text
		add_column :videos, :output_expiry, :text
	end
end
