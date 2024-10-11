import type { BaseTemplate } from '@/lib/types'
import type { Config, Storage } from './types'
import Inspector from './Inspector'
import cover from './cover.jpeg'
import handlers from './handlers'

const initialConfig: Config = {
    fontFamily: 'Roboto',
    fontWeight: 'normal',
    fontStyle: 'normal',
    background: '#000000',
    cooldown: 60,
    isPublic: true,
    coverConfig: {
        title: { text: 'Magic 8 Ball' },
        subtitle: { text: 'Ask a question and receive mystical guidance!' },
        bottomMessage: { text: "Tap 'Ask' to begin" },
        backgroundColor: '#000000',
        textColor: '#FFFFFF',
    },
    answerConfig: {
        title: { text: 'The 8 Ball says...' },
        bottomMessage: { text: 'Ask another question to play again!' },
        backgroundColor: '#000000',
        textColor: '#FFFFFF',
    },
    enableGating: false,
}

const template: BaseTemplate<Config, Storage> = {
    name: 'Magic 8 Ball',
    description: 'Ask a question and receive a mystical answer from the Magic 8 Ball!',
    shortDescription: 'Virtual fortune teller',
    octicon: 'crystal-ball',
    creatorFid: '197049',
    creatorName: 'codingsh',
    cover,
    enabled: true,
    Inspector,
    handlers,
    initialConfig,
    events: ['question.asked', 'question.answered'],
}

export default template
