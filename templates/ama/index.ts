import type { BaseConfig, BaseStorage, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.jpeg'
import handlers from './handlers'


export interface Config extends BaseConfig {
    text: string
    owner: {
        username: string
        fid: number
    } | null
    questions: string[]
    answers: string[]
}

export interface Storage extends BaseStorage {}

export default {
    name: 'AMA',
    description: 'Ask Me Anything',
    shortDescription: "I'm here to answer your question",
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
