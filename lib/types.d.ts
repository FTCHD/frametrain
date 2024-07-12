import type { StaticImageData } from 'next/image'
import type { ElementType } from 'react'
import type { BuildFrameData } from './farcaster'


export interface BaseConfig {
    [key: string]: boolean | number | string | null | undefined | any
}

export interface BaseStorage {
    [key: string]: boolean | number | string | null | undefined | any
}

export type BaseFunction = ({
    body,
    config,
    storage,
    params,
}: { body: any; config: any; storage: any; params: any }) => Promise<BuildFrameData>

export interface BaseFunctions {
    [key: string]: BaseFunction
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