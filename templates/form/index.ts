import type { BaseConfig, BaseStorage, BaseTemplate } from '@/lib/types'
import type { GatingType } from '@/sdk/components/gating/types'
import type { BasicViewStyle } from '@/sdk/views/BasicView'
import Inspector from './Inspector'
import cover from './cover.avif'
import handlers from './handlers'
import icon from './icon.avif'

export type fieldTypes = {
    fieldName: string
    fieldDescription: string
    fieldExample: string
    required: boolean
    fieldType: 'text' | 'number' | 'email' | 'phone' | 'address'
    fieldNameStyle?: BasicViewStyle
    fieldDescriptionStyle?: BasicViewStyle
    fieldExampleStyle?: BasicViewStyle
    background?: string
}

export interface Config extends BaseConfig {
    owner: {
        username: string
        fid: number
    } | null
    fields: fieldTypes[]
    backgroundColor: string
    fontColor: string
    coverText: string
    aboutText: string
    successText: string
    shareText: string
    frameId: string | undefined
    allowDuplicates: boolean
    gating: GatingType | undefined
    enableGating: boolean | undefined
}

export interface Storage extends BaseStorage {
    inputNames: string[]
    data: {
        fid: number
        values: {
            field: string
            value: string
        }[]
        timestamp: number
    }[]
}

export default {
    name: 'Form',
    description: 'Create forms, save the user inputs, and even download them as CSV!',
    shortDescription: 'Download as CSV',
    icon: icon,
    octicon: 'project',
    creatorFid: '417554',
    creatorName: 'onten.eth',
    cover,
    enabled: true,
    Inspector,
    handlers,
    initialConfig: {
        fields: [],
        owner: null,
        backgroundColor: 'linear-gradient(120deg, #f6d365 0%, #fda085 40%)',
        fontColor: '#FFFFFF',
        aboutText: 'This is a form frame!',
        coverText: 'Untitled form',
        shareText: `I'm inviting you all to fill out my new form!`,
        successText: 'Your response has been recorded!',
        frameId: undefined,
        allowDuplicates: false,
        enableGating: false,
        gating: {
            enabled: [],
            requirements: {
                channels: [],
                maxFid: 0,
                minFid: 0,
                exactFids: [],
                score: 0,
                erc20: null,
                erc721: null,
                erc1155: null,
            },
        },
    },
    events: [],
} satisfies BaseTemplate
