'use server'
import type { BuildFrameData } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import BasicView from '@/sdk/views/BasicView'
import type { Config, Storage } from '..'
import cover from './cover'

export default async function initial({
    body,
    config,
    storage,
    params,
}: {
    // GET requests don't have a body.
    body: undefined
    config: Config
    storage: Storage
    params: any
}): Promise<BuildFrameData> {
    console.log('initial', config)

    if (!config.coverType || config.coverType === 'disabled') {
        return await cover({ body, config, storage, params })
    }

    if (config.coverType === 'image') {
        if (!config.coverImageUrl) {
            throw new FrameError('Frame not properly configured (image missing)')
        }
        return {
            buttons: [{ label: 'Start →' }],
            image: config.coverImageUrl,
            handler: 'cover',
        }
    }

    if (!config.coverStyling) {
        throw new FrameError('Frame not properly configured (no styling)')
    }

    const roboto = await loadGoogleFontAllVariants('Roboto')

    return {
        buttons: [{ label: 'Start →' }],
        fonts: roboto,
        component: BasicView(config.coverStyling),
        handler: 'cover',
    }
}
