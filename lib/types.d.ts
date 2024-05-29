import type { StaticImageData } from 'next/image'
import type { ElementType } from 'react'
import type { BuildFrameData } from './farcaster'


export interface BaseConfig {
    [key: string]: boolean | number | string | null | undefined | any
}

export interface BaseState {
    [key: string]: boolean | number | string | null | undefined | any
}

export interface BaseFunctions {
    [key: string]: (body: any, config: any, state: any, params: any) => Promise<BuildFrameData>
}

export interface BaseTemplate {
    name: string
    description: string
    creatorFid: string // must be a farcaster fid
    creatorName: string
    enabled: boolean
    Inspector: ElementType
    functions: BaseFunctions
    initialConfig?: any
    cover: StaticImageData
    requiresValidation: boolean
}