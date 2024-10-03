import BasicView from '@/sdk/views/BasicView'
import type { NFT, ReservoirOrderResponse } from '../types'

const SellView = (nft: NFT, listingData: ReservoirOrderResponse) => (
    <BasicView
        title={`Sell ${nft.name}`}
        subtitle={`List Price: ${listingData.price} ETH`}
        background={nft.imageUrl}
    />
)

export default SellView
