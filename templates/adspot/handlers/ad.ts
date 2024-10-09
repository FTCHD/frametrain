'use server'
import type { BuildFrameData, FrameButtonMetadata, FramePayloadValidated } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, Storage } from '..'
import bid from './bid'
import info from './info'
import initial from './initial'

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

    if (params?.skip !== 'true' && buttonIndex === 1) {
        return info({ config, storage, params, body })
    }

    if (params?.role === 'bidder') {
        return bid({
            config,
            body,
            storage,
        })
    }

    if (params?.role === 'owner') {
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
