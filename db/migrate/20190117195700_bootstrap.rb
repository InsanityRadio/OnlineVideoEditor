class Bootstrap < ActiveRecord::Migration[5.2]
	def change

		create_table(:users) do |t|
			t.string :external_ref, limit: 255
			t.string :username, limit: 255
			t.string :name, limit: 255

			t.boolean :is_admin, default: false
			t.boolean :is_social, default: false
		end

		create_table(:imports) do |t|
			t.references :created_by, index: true, foreign_key: {to_table: :users}
		end

		create_table(:videos) do |t|
			t.references :import
			t.references :created_by, index: true, foreign_key: {to_table: :users}

			t.string :type, default: 'default'
			t.text :configuration
		end

		create_table(:shares) do |t|
			t.references :video
			t.references :created_by, index: true, foreign_key: {to_table: :users}

			t.string :platform
			t.string :title
			t.text :description

			t.datetime :publish_on

			t.boolean :shared, default: false
		end

	end
end
