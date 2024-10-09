import type { BaseConfig, BaseStorage, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.jpeg'
import handlers from './handlers'

export interface Config extends BaseConfig {
    text: string
}

export interface Storage extends BaseStorage {}

export default {
    name: 'NFT Marketplace',
    description: 'Create your own NFT marketplace in a Frame!',
    shortDescription: 'NFT Marketplace + Farcaster',
    octicon: 'paintbrush',
    creatorFid: '197049',
    creatorName: 'codingsh',
    cover,
    enabled: true,
    Inspector,
    handlers,
    initialConfig: {
        title: 'My NFT Marketplace',
        description: 'Buy and sell amazing NFTs!',
        coverImage: '',
        nfts: [],
        gating: {
            enabled: [],
            requirements: {
                maxFid: 0,
                minFid: 0,
                score: 0,
                channels: [],
                exactFids: [],
                erc20: null,
                erc721: null,
                erc1155: null,
                moxie: null,
            },
        },
    },
    events: [],
} satisfies BaseTemplate
