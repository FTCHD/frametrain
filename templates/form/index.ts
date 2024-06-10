import type { BaseConfig, BaseState, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.jpeg'
import functions from './functions'
import { randomUUID } from 'crypto'

export type fieldTypes = {
    fieldName: string,
    fieldDescription: string,
    fieldExample: string,
    isNecessary: boolean,
    fieldType: 'text' | 'number' | 'email' | 'phone' | 'address'
}

export interface Config extends BaseConfig {
    fields: fieldTypes[] | [],
    form_id: string,
    backgroundColor: string,
    coverText: string,
    successText: string
}

interface DATA_RECORD{
    fid: number,
    inputValues: string[] | [],
    timestamp: number
}

// export interface State extends BaseState {
//     pageType: 'init' | 'input' | 'review' | 'success' | 'submitted-before' | 'about' | undefined,
//     inputValues: string[] | [],
//     inputFieldNumber: number,
//     totalInputFieldNumber: number
// }
export interface State extends BaseState {
    inputNames: string[],
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
    initialConfig: {fields: [], form_id: randomUUID(), backgroundColor: 'linear-gradient(120deg, #f6d365 0%, #fda085 40%)'},
    requiresValidation: false,
} satisfies BaseTemplate