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
    description: 'Create a GIF/Trailer Frame from YouTube.',
    creatorFid: '416810',
    creatorName: 'alekcangp',
    cover,
    enabled: true,
    Inspector,
    functions,
    initialConfig: {
        gif: 'https://i.postimg.cc/fLRwTKnF/roboto.gif',
        label: 'VIEW',
        link: 'https://www.youtube.com/watch?v=DYCIlghl5rI#t=15',
    },
    requiresValidation: false,
} satisfies BaseTemplate
