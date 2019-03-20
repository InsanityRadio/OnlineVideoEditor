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
			t.references :user
			t.string :uuid
			t.string :service
			t.string :title
		end

		create_table(:videos) do |t|
			t.references :import
			t.references :user
			t.string :video_type, default: 'default'
			t.text :configuration
			t.boolean :queued, default: false
			t.boolean :rendered, default: false
		end

		create_table(:shares) do |t|
			t.references :video
			t.references :user
			t.string :platform
			t.string :title
			t.text :description

			t.datetime :publish_on

			t.boolean :shared, default: false
		end

	end
end
