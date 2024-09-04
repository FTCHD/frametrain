import type { BaseConfig, BaseStorage, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.jpeg'
import handlers from './handlers'

export interface Config extends BaseConfig {
    text: string
}

export interface Storage extends BaseStorage {}

export default {
    name: 'Starter',
    description: 'Copy this template to create your own',
    shortDescription: 'Appears as composer action description (max 20 characters)',
    octicon: 'gear', // https://docs.farcaster.xyz/reference/actions/spec#valid-icons
    creatorFid: '0',
    creatorName: 'FrameTrain',
    cover,
    enabled: true,
    Inspector,
    handlers,
    initialConfig: {
        text: 'Default Text',
    },
    events: [],
} satisfies BaseTemplate
