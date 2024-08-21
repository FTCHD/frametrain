import type { BaseConfig, BaseStorage, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.jpeg'
import handlers from './handlers'
import type { GatingOptionsProps } from '@/sdk/components/GatingOptions'

export type fieldTypes = {
    fieldName: string
    fieldDescription: string
    fieldExample: string
    required: boolean
    fieldType: 'text' | 'number' | 'email' | 'phone' | 'address'
}

export interface Config extends BaseConfig {
    owner?: {
        username: string
        fid: number
    }
    fields: fieldTypes[] | []
    backgroundColor: string
    fontColor: string
    coverText: string
    aboutText: string
    successText: string
    shareText: string
    frameId: string
    allowDuplicates: boolean
    gating?: GatingOptionsProps['config']
    enableGating?: boolean
}

interface DATA_RECORD {
    fid: number
    inputValues: string[] | []
    timestamp: number
}

export interface Storage extends BaseStorage {
    inputNames: string[]
    data: DATA_RECORD[]
}

export default {
    name: 'Form',
    description: 'Create forms and save the user inputs!',
    shortDescription: 'Validated Responses!',
    icon: 'project',
    creatorFid: '417554',
    creatorName: 'onten.eth',
    cover,
    enabled: true,
    Inspector,
    handlers,
    initialConfig: {
        fields: [],
        backgroundColor: 'linear-gradient(120deg, #f6d365 0%, #fda085 40%)',
        fontColor: '#FFFFFF',
        shareText: 'Check This Out!',
        frameId: undefined,
        allowDuplicates: false,
        enableGating: false,
        gating: {
            channels: {
                checked: false,
                data: [],
            },
            followedBy: false,
            following: false,
            liked: false,
            recasted: false,
            eth: false,
            sol: false,
            powerBadge: false,
            maxFid: 0,
            score: 0,
            erc20: null,
            erc721: null,
            erc1155: null,
        },
    },
    requiresValidation: true,
    events: [],
} satisfies BaseTemplate
