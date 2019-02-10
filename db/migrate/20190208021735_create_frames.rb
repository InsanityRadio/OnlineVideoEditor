class CreateFrames < ActiveRecord::Migration[5.2]
	def change
		create_table(:frames) do |t|
			t.references :user
			t.string :name
			t.boolean :layer_type, :default => 'foreground'
			t.text :configuration, :limit => 4294967295
		end
	end
end
