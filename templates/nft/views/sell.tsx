import BasicView from '@/sdk/views/BasicView'
import type { NFT, ReservoirOrderResponse } from '../types'

import { weiToEth } from '../utils/formatters'

const SellView = (nft: NFT, listingData: ReservoirOrderResponse) => (
    <BasicView
        title={`Sell ${nft?.name || 'NFT'}`}
        subtitle={`List Price: ${listingData?.price ? weiToEth(listingData.price) : 'N/A'} ETH`}
        background={nft?.imageUrl || '/nft/fallback-image.jpg'}
    />
)

export default SellView
