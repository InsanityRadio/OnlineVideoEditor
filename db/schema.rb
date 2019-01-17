# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2019_01_17_195700) do

  create_table "imports", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8", force: :cascade do |t|
    t.bigint "created_by_id"
    t.index ["created_by_id"], name: "index_imports_on_created_by_id"
  end

  create_table "shares", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8", force: :cascade do |t|
    t.bigint "video_id"
    t.bigint "created_by_id"
    t.string "platform"
    t.string "title"
    t.text "description"
    t.datetime "publish_on"
    t.boolean "shared", default: false
    t.index ["created_by_id"], name: "index_shares_on_created_by_id"
    t.index ["video_id"], name: "index_shares_on_video_id"
  end

  create_table "users", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8", force: :cascade do |t|
    t.string "external_ref"
    t.string "username"
    t.string "name"
    t.boolean "is_admin", default: false
    t.boolean "is_social", default: false
  end

  create_table "videos", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8", force: :cascade do |t|
    t.bigint "import_id"
    t.bigint "created_by_id"
    t.string "type", default: "default"
    t.text "configuration"
    t.index ["created_by_id"], name: "index_videos_on_created_by_id"
    t.index ["import_id"], name: "index_videos_on_import_id"
  end

  add_foreign_key "imports", "users", column: "created_by_id"
  add_foreign_key "shares", "users", column: "created_by_id"
  add_foreign_key "videos", "users", column: "created_by_id"
end
