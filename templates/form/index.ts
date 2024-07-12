import type { BaseConfig, BaseStorage, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.jpeg'
import functions from './functions'

export type fieldTypes = {
    fieldName: string
    fieldDescription: string
    fieldExample: string
    required: boolean
    fieldType: 'text' | 'number' | 'email' | 'phone' | 'address'
}

export interface Config extends BaseConfig {
    fields: fieldTypes[] | []
    backgroundColor: string
    fontColor: string
    coverText: string
    aboutText: string
    successText: string
    shareText: string
    frameId: string
    allowDuplicates: boolean
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
    name: 'Form Template',
    description: 'Create forms and save the user inputs!',
    creatorFid: '417554',
    creatorName: 'onten.eth',
    cover,
    enabled: true,
    Inspector,
    functions,
    initialConfig: {
        fields: [],
        backgroundColor: 'linear-gradient(120deg, #f6d365 0%, #fda085 40%)',
        fontColor: '#FFFFFF',
        shareText: 'Check This Out!',
        frameId: undefined,
        allowDuplicates: false,
    },
    requiresValidation: true,
} satisfies BaseTemplate
