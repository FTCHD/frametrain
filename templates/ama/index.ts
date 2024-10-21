import type { BaseConfig, BaseStorage, BaseTemplate } from '@/lib/types'
import type { BasicViewProps } from '@/sdk/views/BasicView'
import Inspector from './Inspector'
import cover from './cover.jpeg'
import handlers from './handlers'

export interface Config extends BaseConfig {
    cover: BasicViewProps
}

export type Question = {
    userId: string
    userName: string
    userIcon: string | undefined
    question: string
    answer?: string | undefined
    askedAt: Date
    answeredAt?: Date | undefined
}

export interface Storage extends BaseStorage {
    questions: Question[]
}

export default {
    name: 'AMA',
    description: 'Let people ask you anything!',
    shortDescription: 'Ask.fm on Farcaster',
    octicon: 'question',
    creatorFid: '260812',
    creatorName: 'Steve',
    cover,
    enabled: true,
    Inspector,
    handlers,
    initialConfig: {
        cover: {
            title: {
                text: 'Ask me anything!',
                textAlign: 'center',
            },
            subtitle: {
                text: "I'm here to help you with your questions and concerns. Ask me anything!",
                textAlign: 'center',
            },
        },
    },
    events: [],
} satisfies BaseTemplate
