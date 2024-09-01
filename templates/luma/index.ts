import type { BaseConfig, BaseStorage, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.avif'
import handlers from './handlers'
import icon from './icon.avif'

export interface Config extends BaseConfig {
    event?: {
        id: string
        price: string
        backgroundImage: string
        hosts: string[]
        startsAt: string
        endsAt: string
        timezone: string
        title: string
        address: string
        image: string
        approvalRequired?: boolean
        remainingSpots?: number | null
        ticketTypeId: string | null
        eventId: string | null
    }
    backgroundColor?: string
    textColor?: string
    priceColor?: string
    priceBackgroundColor?: string
    infoColor?: string
}

export interface Storage extends BaseStorage {
    registeredUsers: { fid: number; email: string }[]
}

export default {
    name: 'Lu.ma',
    description: 'Share your Lu.ma event and let other join straight from a Frame.',
    shortDescription: 'Events as Frames',
    icon: icon,
    octicon: 'star',
    creatorFid: '260812',
    creatorName: 'Steve',
    cover,
    enabled: true,
    Inspector,
    handlers,
    requiresValidation: true,
    initialConfig: {
        event: undefined,
    },
    events: ['register'],
} satisfies BaseTemplate
