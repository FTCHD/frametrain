import type {
    Channel as NeynarChannel,
    User as NeynarUser,
    ValidatedFrameActionResponse as NeynarValidatedFrameActionResponse,
} from '@neynar/nodejs-sdk/build/neynar-api/v2'
import type {
    FrameActionPayload as FramesJSFrameActionPayload,
    TransactionTargetResponse,
} from 'frames.js'
import type { ReactElement } from 'react'
import type { BaseStorage } from './types'

// We use the version from OnchainKit because it doesn't set the `action` and `target` fields as required.
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

// Can also use FrameRequest type from onchainkit
export type FrameActionPayload = FramesJSFrameActionPayload

export type FrameValidatedActionPayload = NeynarValidatedFrameActionResponse

export type FarcasterUserInfo = NeynarUser
export type FarcasterChannel = NeynarChannel

export type FrameActionPayloadValidated = FrameActionPayload & {
    validatedData: FrameValidatedActionPayload['validatedData']
}

export interface BuildFrameData {
    buttons: FrameButtonMetadata[]
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
}
