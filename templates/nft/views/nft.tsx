import BasicView from '@/sdk/views/BasicView'
import type React from 'react'
import type { NFT } from '../types'

const NFTView: React.FC<{ nfts: NFT[]; currentIndex: number }> = ({ nfts, currentIndex }) => {
    const nft = nfts[currentIndex]

    return (
        <BasicView title={nft.name} subtitle={nft.description} background={nft.imageUrl}>
            <div className="flex justify-between mt-4">
                <button
                    type="button"
                    disabled={currentIndex === 0}
                    className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
                >
                    Previous
                </button>
                <button
                    type="button"
                    disabled={currentIndex === nfts.length - 1}
                    className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </BasicView>
    )
}

export default NFTView
