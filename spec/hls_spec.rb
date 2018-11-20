require_relative 'spec_helper'

describe OVE::HLS::Manifest do 

	context 'when given an HLS manifest' do

		it 'can correctly split it into chunks' do

			dummy_hls = <<end
#EXTM3U
#EXT-X-VERSION:3
#EXT-X-MEDIA-SEQUENCE:9621
#EXT-X-TARGETDURATION:10

#EXTINF:5.108,
2.9621.ts
#EXTINF:5.108,
2.9622.ts
#EXTINF:5.108,
2.9623.ts
#EXTINF:5.062,
2.9624.ts
#EXTINF:5.108,
2.9625.ts
#EXTINF:5.108,
2.9626.ts
end

			manifest = OVE::HLS::Manifest.from dummy_hls
			expect(manifest.version).to eq(3)

			chunks = manifest.chunks

			expect(chunks.length).to eq(6)
			expect(chunks[0].path).to eq('2.9621.ts')
			expect(chunks[0].length).to eq(5.108)

			expect(chunks[1].chunk_id).to eq(9622)
			expect(chunks[5].chunk_id).to eq(9626)

			found = chunks.find_by_name('2.9621.ts')
			expect(found).not_to be_nil

		end

		it 'can correctly generate a HLS manifest' do

			dummy_hls = <<end
#EXTM3U
#EXT-X-VERSION:3
#EXT-X-MEDIA-SEQUENCE:9621
#EXT-X-TARGETDURATION:10

#EXTINF:5.108,
2.9621.ts
#EXTINF:5.108,
2.9622.ts
#EXTINF:5.108,
2.9623.ts
#EXTINF:5.062,
2.9624.ts
#EXTINF:5.108,
2.9625.ts
#EXTINF:5.108,
2.9626.ts
end

			manifest = OVE::HLS::Manifest.from dummy_hls

			manifest_str = manifest.to_s

			manifest_comp = OVE::HLS::Manifest.from manifest_str

			expect(manifest_comp.media_sequence).to eq(manifest.media_sequence)

			chunks = manifest.chunks

			expect(chunks.length).to eq(6)
			expect(chunks[0].path).to eq('2.9621.ts')
			expect(chunks[0].length).to eq(5.108)
			expect(chunks[5].chunk_id).to eq(9626)


		end

	end

end
