import type { BaseConfig, BaseStorage, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.jpeg'
import handlers from './handlers'

export interface Config extends BaseConfig {
    mode: 'Continuous' | 'Auction'
    coverType: 'text' | 'image'
    cover: {
        title: string
        subtitle?: string
        image?: string
        backgroundColor: string
        textColor: string
    }
    visitLink: string
    deadline?: number 
    expiry?: number 
    owner: string
    currency: string
}

export interface Storage extends BaseStorage {
    currentAd: {
        image?: string
        visitLink: string
        winner?: string
        expiryTime?: number
    }
    bids: Array<{
        bidder: string
        amount: number
        timestamp: number
    }>
    highestBid: number
}

export default {
    name: 'Ad Space Rental',
    description: 'Rent ad space on your Farcaster profile',
    shortDescription: 'Rent your profile space',
    octicon: 'megaphone',
    creatorFid: '197049',
    creatorName: 'codingsh',
    cover,
    enabled: true,
    Inspector,
    handlers,
    initialConfig: {
        mode: 'Continuous',
        coverType: 'image',
        cover: {
            title: 'Rent This Ad Space',
            subtitle: 'Click for more info',
            backgroundColor: '#000000',
            textColor: '#FFFFFF'
        },
        visitLink: '',
        expiry: 24,
        owner: '',
        currency: 'ETH',
    },
    events: ['bid', 'adChanged', 'adExpired'],
} satisfies BaseTemplate