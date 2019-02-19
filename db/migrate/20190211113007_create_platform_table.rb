class CreatePlatformTable < ActiveRecord::Migration[5.2]
	def change
		create_table(:platforms) do |t|
			t.string :name
			t.text :default_share_text
			t.string :platform_type
			t.text :configuration, :limit => 4294967295
		end
	end
end
