import type {
    Channel as NeynarChannel,
    User as NeynarUser,
    ValidateFrameActionResponse as NeynarValidatedFrameActionResponse,
} from '@neynar/nodejs-sdk/build/neynar-api/v2'
import type {
    FrameActionPayload as FramesJSFrameActionPayload,
    TransactionTargetResponse,
} from 'frames.js'
import type { ReactElement } from 'react'
import type { BaseStorage } from './types'

export type FrameButtonMetadata =
    | {
          action?: 'post' | 'post_redirect' | undefined
          label: string
      }
    | {
          action: 'link' | 'mint'
          label: string
          target: string
      }
    | {
          action: 'tx'
          label: string
          handler?: string
          callback?: string
      }

export type FramePayload = FramesJSFrameActionPayload
export type FramePayloadValidated = NeynarValidatedFrameActionResponse['action']

export type FarcasterUserInfo = NeynarUser
export type FarcasterChannel = NeynarChannel

export interface BuildFrameData {
    buttons?: FrameButtonMetadata[]
    aspectRatio?: '1.91:1' | '1:1' | undefined
    inputText?: string
    refreshPeriod?: number
    params?: any
    storage?: BaseStorage
    fonts?: any[]
    component?: ReactElement
    image?: string
    handler?: string
    webhooks?: {
        event: string
        data: Record<string, unknown>
    }[]
    transaction?: TransactionTargetResponse
    openFrameMetadata?: OpenFrameMetadata
}

export interface FrameData {
    buttonIndex: number
    castId: {
        fid: number
        hash: string
    }
    inputText: string
    fid: number
    messageHash: string
    network: number
    state: string
    timestamp: number
    transactionId?: string
    url: string
}

export type FrameImageMetadata = {
    src: string
    aspectRatio?: '1.91:1' | '1:1'
}

export type FrameMetadataType = {
    buttons?: [FrameButtonMetadata, ...FrameButtonMetadata[]]
    image: string | FrameImageMetadata
    input?: { text: string }
    postUrl?: string
    refreshPeriod?: number
    state?: object
}

export interface OpenFrameMetadata {
    version: string
    accepts: Record<ClientProtocol, string>
    image: string
    buttons?: OpenFrameButton[]
    postUrl?: string
    inputText?: string
    imageAspectRatio?: '1.91:1' | '1:1'
    imageAlt?: string
    state?: string
}

export interface OpenFrameButton {
    label: string
    action?: 'post' | 'post_redirect' | 'link' | 'mint' | 'tx'
    target?: string
    postUrl?: string
}

export type ClientProtocol = 'lens' | 'xmtp' | 'anonymous' | 'farcaster'

export interface FrameRequest {
    clientProtocol: string
    untrustedData: {
        url: string
        unixTimestamp: number
        buttonIndex: number
        inputText?: string
        state?: string
        address?: string
        transactionId?: string
    }
    trustedData?: {
        messageBytes: string
    }
}
