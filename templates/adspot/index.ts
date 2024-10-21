import type { BaseConfig, BaseStorage, BaseTemplate } from '@/lib/types'
import type { ChainKey } from '@/sdk/viem'
import type { BasicViewProps } from '@/sdk/views/BasicView'
import Inspector from './Inspector'
import cover from './cover.jpeg'
import icon from './icon.jpeg'
import handlers from './handlers'

export interface Config extends BaseConfig {
    owner: { fid: number; fname: string } | null
    cover: BasicViewProps & {
        image?: string
    }
    success: BasicViewProps & {
        image?: string
    }
    mode: 'auction' | 'continuous'
    token?: {
        address: `0x${string}`
        chain?: ChainKey
        symbol?: string
    }

    minBid: number
    deadline: string
    address: string | undefined
}

export interface Storage extends BaseStorage {
    bids: {
        id: string
        fid: number
        amount: number
        ts: number
        tx: string | null
        approved: boolean
    }[]
    winningBid: string | null
    currentBid: string | null
    ad: {
        image: string
        url?: string
    } | null
}

export default {
    name: 'AdSpot',
    description: 'Your own rental ad space as a frame.',
    shortDescription: 'Rental ad space Frame',
    octicon: 'note', // https://docs.farcaster.xyz/reference/actions/spec#valid-icons
    creatorFid: '260812',
    creatorName: 'Steve',
    cover,
    icon,
    enabled: true,
    Inspector,
    handlers,
    initialConfig: {
        deadline: '24h',
        owner: null,
        mode: 'continuous',
        token: null,
        address: null,
        minBid: 1,
        cover: {
            background: 'linear-gradient(to top left,#AC32E4,#7918F2,#4801FF)',
            title: { text: 'Farcaster AdSpace' },
            subtitle: { text: 'Welcome to the AdSpace!' },
            bottomMessage: { text: 'Put your ad here for more exposure by placing a bid!' },
        },
        success: {
            background: 'linear-gradient(to top left,#AC32E4,#7918F2,#4801FF)',
            title: { text: 'Your bid was successful!' },
            subtitle: { text: 'Thank you for your bid!' },
            bottomMessage: { text: 'Click on "Manage" to setup your ad' },
        },
    },
    events: ['adspot_payment_failed', 'adspot_new_bid', 'adspot_payment_successful'],
} satisfies BaseTemplate
