// Page.tsx

import { useFrameConfig, useFrameStorage } from '@/sdk/hooks'
import type React from 'react'
import type { Config, Storage } from './types'

const Page: React.FC = () => {
    const [config] = useFrameConfig<Config>()
    const storage = useFrameStorage<Storage>()

    return (
        <div>
            <h1>{config.title}</h1>
            <h2>Available NFTs</h2>
            <div className="grid grid-cols-3 gap-4">
                {config.nfts.map((nft) => (
                    <div key={`${nft.contractAddress}-${nft.tokenId}`}>
                        <img src={nft.imageUrl} alt={nft.name} />
                        <h3>{nft.name}</h3>
                        <p>{nft.description}</p>
                    </div>
                ))}
            </div>
            {storage.purchases && storage.purchases.length > 0 && (
                <>
                    <h2>Purchase History</h2>
                    <ul>
                        {storage.purchases.map((purchase, index) => (
                            <li key={index}>
                                Buyer: {purchase.buyer} - NFT: {purchase.nft.name} - Price:{' '}
                                {purchase.price} - Date:{' '}
                                {new Date(purchase.timestamp).toLocaleString()}
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    )
}

export default Page
