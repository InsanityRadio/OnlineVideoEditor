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

ActiveRecord::Schema.define(version: 2019_02_08_021735) do

  create_table "frames", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8", force: :cascade do |t|
    t.bigint "user_id"
    t.string "name"
    t.boolean "layer_type", default: true
    t.text "configuration", limit: 4294967295
    t.index ["user_id"], name: "index_frames_on_user_id"
  end

  create_table "imports", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8", force: :cascade do |t|
    t.bigint "user_id"
    t.string "uuid"
    t.string "service"
    t.string "title"
    t.index ["user_id"], name: "index_imports_on_user_id"
  end

  create_table "shares", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8", force: :cascade do |t|
    t.bigint "video_id"
    t.bigint "user_id"
    t.string "platform"
    t.string "title"
    t.text "description"
    t.datetime "publish_on"
    t.boolean "shared", default: false
    t.index ["user_id"], name: "index_shares_on_user_id"
    t.index ["video_id"], name: "index_shares_on_video_id"
  end

  create_table "slates", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8", force: :cascade do |t|
    t.bigint "user_id"
    t.string "path"
    t.boolean "is_outro"
    t.decimal "cue_point", precision: 10, scale: 2
    t.index ["user_id"], name: "index_slates_on_user_id"
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
    t.bigint "user_id"
    t.string "video_type", default: "default"
    t.text "configuration", limit: 4294967295
    t.boolean "queued", default: false
    t.boolean "rendered", default: false
    t.text "worker_id"
    t.text "output_path"
    t.text "output_expiry"
    t.index ["import_id"], name: "index_videos_on_import_id"
    t.index ["user_id"], name: "index_videos_on_user_id"
  end

end
