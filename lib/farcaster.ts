'use server'

// TODO: Propose renaming this file to protocol.ts i.e. @/lib/protocol

import {
    isXmtpFrameActionPayload,
    getXmtpFrameMessage,
    type XmtpFrameMessageReturnType,
} from 'frames.js/xmtp'

import {
    isLensFrameActionPayload,
    getLensFrameMessage,
    type LensFrameResponse,
    type LensFrameRequest,
} from 'frames.js/lens'

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

export type FarcasterFramePayload = FramesJSFrameActionPayload
export type FarcasterFramePayloadValidated = NeynarValidatedFrameActionResponse['action']

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

export interface FrameRequest {
    untrustedData: FrameData
    trustedData: {
        messageBytes: string
    }
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


export type FramePayload = {
    clientProtocol: string | undefined
}

/**
 * Represents a normalized frame request payload, supporting Farcaster, Lens Protocol, and XMTP.
 */
export type FramePayloadValidated = {
    protocol: 'farcaster' | 'lens' | 'xmtp'
    url: NeynarValidatedFrameActionResponse['action']['url'] // also used for lens.url and xmtp.frame_url
    buttonIndex: NeynarValidatedFrameActionResponse['action']['tapped_button']['index']
    // TODO inputText: NeynarValidatedFrameActionResponse['action']['input']['text']
    inputText: string,
    state: string | undefined // fc.state.serialized, also used for openframes.state
    // fc.transaction.hash, also used for openframes.transactionId and lens.transaction & lens.actionResponse
    transaction?: string | undefined
    // also used for openframes.address and openframes.connectedAddress
    address?: NeynarValidatedFrameActionResponse['action']['address']
    // also used for openframes.unix_timestamp normalized timestamp regardless of protocol, in ms
    // unix ts for fc too (where it starts from a weird place), a lib function to convert from/to unix/fc timestamp would be useful
    timestamp: Date 
    userId: string // fc:fid, lens:id, xmtp:address
    userName: string // fc:username, lens:id, xmtp:address
    userIcon?: string | undefined
    fc?:
        | {
              followers: NeynarValidatedFrameActionResponse['action']['interactor']['follower_count']
              following: NeynarValidatedFrameActionResponse['action']['interactor']['following_count']
              viewerContext: {
                  recasted: boolean
                  liked: boolean
                  following: boolean
                  followedBy: boolean
              }
              ethAddresses: NeynarValidatedFrameActionResponse['action']['interactor']['verified_addresses']['eth_addresses']
              solAddresses: NeynarValidatedFrameActionResponse['action']['interactor']['verified_addresses']['sol_addresses']
              cast: NeynarValidatedFrameActionResponse['action']['cast']
          }
        | undefined
    lens?:
        | {
            pubId: string
        }
        | undefined
}

export async function validatePayload(framePayload: FramePayload): Promise<FramePayloadValidated> {
    if (!framePayload.clientProtocol)
    {
        const fcPayload = await validatePayloadFarcaster(framePayload as FarcasterFramePayload)
        return standardizeFarcasterPayload(fcPayload)
    }

    if (isXmtpFrameActionPayload(framePayload)) {
        const xmtpPayload = await getXmtpFrameMessage(framePayload)
        return standardizeXmtpPayload(xmtpPayload)
    }

    if (isLensFrameActionPayload(framePayload)) {
        const lensPayload = await getLensFrameMessage(framePayload)
        return standardizeLensPayload(framePayload, lensPayload)
    }

    throw new Error(`Unsupported client protocol: ${framePayload.clientProtocol}`)
}

export async function isFarcasterFrameActionPayload(framePayload: FramePayload): Promise<boolean> {
    return !framePayload.clientProtocol
}

export async function validatePayloadFarcaster(body: FarcasterFramePayload): Promise<FarcasterFramePayloadValidated> {
    const options = {
        method: 'POST',
        headers: {
            accept: 'application/json',
            api_key: process.env.NEYNAR_API_KEY!,
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            cast_reaction_context: true,
            follow_context: true,
            signer_context: true,
            message_bytes_in_hex: body.trustedData.messageBytes,
        }),
    }

    const r = await fetch('https://api.neynar.com/v2/farcaster/frame/validate', options)
        .then((response) => response.json())
        .catch((err) => {
            console.error(err)
            throw new Error('PAYLOAD_COULD_NOT_BE_VALIDATED')
        })

    if (!r.valid) {
        throw new Error('PAYLOAD_NOT_VALID')
    }

    console.log(r.action)

    return r.action
}

export async function validatePayloadAirstack(
    body: FarcasterFramePayload,
    airstackKey: string
): Promise<any> {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/octet-stream',
            'x-airstack-hubs': airstackKey,
        },
        body: new Uint8Array(
            body.trustedData.messageBytes.match(/.{1,2}/g)!.map((byte) => Number.parseInt(byte, 16))
        ),
    }

    const r = await fetch('https://hubs.airstack.xyz/v1/validateMessage', options)
        .then((response) => response.json())
        .catch((err) => {
            console.error(err)
            throw new Error('AIRSTACK_PAYLOAD_COULD_NOT_BE_VALIDATED')
        })

    return r
}

function standardizeFarcasterPayload(payload: FarcasterFramePayloadValidated): FramePayloadValidated {
    const userId = `fc:${payload.interactor.fid}`
    const farcasterEpoch = new Date('2021-01-01T00:00:00Z').getTime();
    const timestampInMs = farcasterEpoch + (Number(payload.timestamp) * 1000);

    return {
        protocol: 'farcaster',
        url: payload.url,
        buttonIndex: payload.tapped_button.index,
        inputText: payload.input?.text || '',
        state: payload.state.serialized,
        transaction: payload.transaction?.hash,
        address: payload.address,
        timestamp: new Date(timestampInMs),
        userId: userId,
        userName: payload.interactor.username,
        userIcon: payload.interactor.pfp_url,
        fc: {
            followers: payload.interactor.follower_count,
            following: payload.interactor.following_count,
            viewerContext: {
                recasted: payload.cast.viewer_context?.recasted ?? false,
                liked: payload.cast.viewer_context?.liked ?? false,
                following: payload.interactor.viewer_context?.following ?? false,
                followedBy: payload.interactor.viewer_context?.followed_by ?? false,
            },
            ethAddresses: payload.interactor.verified_addresses.eth_addresses,
            solAddresses: payload.interactor.verified_addresses.sol_addresses,
            cast: payload.cast,
        }
    };
}

/**
 * Standardizes a Lens frame request payload.
 * Unlike Farcaster and XMTP frames, with Lens the server is expected to read
 * 'untrustedData' once signature validation has passed. Thus, untrusted data
 * is an input to this function. 
 * Reference: https://lensframes.xyz/
 */
function standardizeLensPayload(request: LensFrameRequest, response: LensFrameResponse): FramePayloadValidated {
    const userId = `lens:${response.address}`
    return {
        protocol: 'lens',
        url: response.url,
        buttonIndex: response.buttonIndex,
        inputText: response.inputText,
        state: response.state,
        transaction: response.actionResponse,
        address: response.address,
        timestamp: new Date(request.untrustedData.unixTimestamp),
        userId: userId,
        userName: userId, // TODO use lensclient?
        userIcon: undefined, // TODO use lensclient?
        lens: {
            pubId: response.pubId
        }
    };
}

function standardizeXmtpPayload(payload: XmtpFrameMessageReturnType): FramePayloadValidated {
    const userId = `xmtp:${payload.address}`
    return {
        protocol: 'xmtp',
        url: payload.url,
        buttonIndex: payload.buttonIndex,
        inputText: payload.inputText,
        state: payload.state,
        transaction: payload.transactionId,
        address: payload.address,
        timestamp: new Date(payload.unixTimestamp),
        userId: userId,
        userName: userId, // TODO use xmtp client?
        userIcon: undefined, // TODO use xmtp client?
    };
}
