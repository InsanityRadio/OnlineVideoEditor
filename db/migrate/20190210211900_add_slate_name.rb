class AddSlateName < ActiveRecord::Migration[5.2]
	def change
		add_column :slates, :name, :string
	end
end
