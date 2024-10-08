'use server'
import type { BuildFrameData, FrameButtonMetadata, FramePayloadValidated } from '@/lib/farcaster'
import type { Config, Storage } from '..'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import info from './info'
import buy from './buy'
import initial from './initial'
import { FrameError } from '@/sdk/error'

export default async function ad({
    body,
    config,
    storage,
    params,
}: {
    body: FramePayloadValidated
    config: Config
    storage: Storage
    params: { skip: string; field: string; role: 'bidder' | 'winner' | 'owner' } | undefined
}): Promise<BuildFrameData> {
    const buttonIndex = body.tapped_button.index
    let inputText: string | undefined = undefined
    const inputValue = body.input?.text
    const isBidder = params?.role === 'bidder'
    const isOwner = params?.role === 'owner'

    if (params?.skip !== 'true' && buttonIndex === 1) {
        return info({ config, storage, params, body })
    }

    if (isBidder) {
        return buy({
            config,
            body,
            storage,
            params: {
                bid: 'true',
            },
        })
    }

    if (isOwner) {
        return initial({ config, storage })
    }

    const fonts = await loadGoogleFontAllVariants('Nunito Sans')
    const winningBid = storage.winningBid
        ? (storage.bids || []).find((bid) => bid.id === storage.winningBid && bid.tx !== undefined)
        : null

    if (winningBid?.fid !== body.interactor.fid) {
        throw new FrameError('Oops, you are not the bidder of the winning bet')
    }

    const buttons: FrameButtonMetadata[] = []
    let newStorage = storage || {}
    let field = params?.field

    switch (field) {
        case 'image': {
            if (!(storage.ad || inputValue)) {
                throw new FrameError('Sorry, your add image is required')
            }

            newStorage = {
                ...storage,
                ad: {
                    image: inputValue + '',
                },
            }
            field = 'link'
            inputText = 'Ad link (optional)'
            break
        }

        case 'link': {
            newStorage = {
                ...storage,
                ad: {
                    ...(storage.ad || {}),
                    image: inputValue + '',
                },
            }
            inputText = undefined
            field = undefined
            break
        }

        default: {
            inputText = 'Ad image link'
            break
        }
    }

    if (newStorage.ad?.url) {
        buttons.push({
            label: 'Visit',
            action: 'link',
            target: newStorage.ad.url,
        })
    }

    return {
        buttons,
        fonts,
        storage: newStorage,
        handler: 'ad',
        params: {
            field,
            skip: true,
        },
        inputText,
    }
}
