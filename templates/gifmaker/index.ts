import type { BaseConfig, BaseState, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.jpeg'
import functions from './functions'

export interface Config extends BaseConfig {
    gif: string
    label: string
    link: string
}

export interface State extends BaseState {}

export default {
    name: 'GIF Maker',
    description: 'Create a GIF/Trailer Frame from video.',
    creatorFid: '416810',
    creatorName: 'alekcangp',
    cover,
    enabled: true,
    Inspector,
    functions,
    initialConfig: {
        gif: 'https://ipfs.io/ipfs/QmZ3SuHbBcZvyBTsCEWZgYFXBXpUW9TQQLctv6Fr2Eva9U',
        label: 'LINK',
        link: 'https://frametra.in'
    },
    requiresValidation: false,
} satisfies BaseTemplate