import type { BaseConfig, BaseState, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.jpeg'
import functions from './functions'

export interface Config extends BaseConfig {
    name: string
    repo: number
    issues: number
    pr: number
    commits: number
    imageUrl: string
    fontFamily?: string
    titleColor?: string
    titleWeight?: string
    titleStyle?: string
    background?: string
    bodyColor?: string
}

export interface State extends BaseState {}

export default {
    name: 'Github Stats',
    description: 'Create a Github Stats Frame for your Farcaster profile',
    creatorFid: '389273',
    creatorName: 'leofrank',
    cover,
    enabled: true,
    Inspector,
    functions,
    initialConfig: {
        name: '',
        repo: 0,
        issues: 0,
        pr: 0,
        commits: 0,
        imageUrl: '',
    },
    requiresValidation: false,
} satisfies BaseTemplate
