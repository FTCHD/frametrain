import type { BaseConfig, BaseState, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.png'
import functions from './functions'

export interface Config extends BaseConfig {
    githubLink: string,
    full_name: string,
    stargazers_count: number,
    watchers_count: number,
    forks_count: number,
    description: string,
    owner_avatar_url: string,
    owner_login: string,
}

export interface State extends BaseState {}

export default {
    name: 'Cardvisit Template',
    description: 'You can create your own cardvisit as frame',
    creatorFid: '6',
    creatorName: 'Taio Newgate',
    cover,
    enabled: true,
    Inspector,
    functions,
    initialConfig: {
        githubLink: "",
        full_name: "",
        stargazers_count: 0,
        watchers_count: 0,
        forks_count: 0,
        description: "",
        owner_avatar_url: "",
        owner_login: "",
    },
    requiresValidation: false,
} satisfies BaseTemplate
