class AddSlate < ActiveRecord::Migration[5.2]
	def change
		create_table(:slates) do |t|
			t.references :user
			t.string :path
			t.boolean :is_outro
			t.decimal :cue_point, precision: 10, scale: 2
		end
	end
end
