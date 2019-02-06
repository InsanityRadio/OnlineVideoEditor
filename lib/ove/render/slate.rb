module OVE
	module Render
		class Slate < Base

			def initialize video
				super video
				@intro_slate = OVE::Model::Slate.find_by(options['intro_slate_id'])
				@outro_slate = OVE::Model::Slate.find_by(options['outro_slate_id'])
			end

			def render_video
				@source_path
				@output_path

				if @intro_slate == nil && @outro_slate == nil
					# render raw video
				else
					render_video_with_slate
				end
			end

			def render_video_with_slate
				command = [
					'./scripts/slate',
					@source_path + ",#{start_time},#{length}",
					@intro_slate.path + ',' + @intro_slate.cue_point,
					@outro_slate.path,
					@output_path
				]
			end
		end
	end
end
