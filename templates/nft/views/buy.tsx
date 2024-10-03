import BasicView from '@/sdk/views/BasicView'
import type { NFT, ReservoirOrderResponse } from '../types'

const BuyView = (nft: NFT, buyData: ReservoirOrderResponse) => (
    <BasicView
        title={`Buy ${nft.name}`}
        subtitle={`Price: ${buyData.price} ETH`}
        background={nft.imageUrl}
    />
)

export default BuyView
