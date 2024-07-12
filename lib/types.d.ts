import type { StaticImageData } from 'next/image'
import type { ElementType } from 'react'
import type { BuildFrameData } from './farcaster'


export interface BaseConfig {
    [key: string]: boolean | number | string | null | undefined | any
}

export interface BaseStorage {
    [key: string]: boolean | number | string | null | undefined | any
}

export type BaseHandler = ({
    body,
    config,
    storage,
    params,
}: { body: any; config: any; storage: any; params: any }) => Promise<BuildFrameData>

export interface BaseHandlers {
    [key: string]: BaseHandler
}

export interface BaseTemplate {
    name: string
    description: string
    creatorFid: string // must be a farcaster fid
    creatorName: string
    enabled: boolean
    Inspector: ElementType
    handlers: BaseHandlers
    initialConfig?: any
    cover: StaticImageData
    requiresValidation: boolean
}