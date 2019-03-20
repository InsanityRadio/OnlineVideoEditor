module OVE
	module Render
		# RenderProvider allows us to look up the appropriate render class for a video
		class RenderProvider
			def self.find_by name
				case name
				when 'frame'
					OVE::Render::Frame
				when 'slate'
					OVE::Render::Slate
				end
			end
		end
	end
end