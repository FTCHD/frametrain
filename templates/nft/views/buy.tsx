import BasicView from '@/sdk/views/BasicView'
import type { NFT, ReservoirOrderResponse } from '../types'
import { weiToEth } from '../utils/formatters'

const BuyView = ({ nft, buyData }: { nft: NFT; buyData: ReservoirOrderResponse }) => (
    <BasicView
        title={`Buy ${nft.name || 'Unnamed NFT'}`}
        subtitle={`Price: ${buyData.price ? `${weiToEth(buyData.price).toFixed(4)} ETH` : 'N/A'}`}
        background={nft.imageUrl || '/nft/fallback-image.jpg'}
    />
)

export default BuyView
