'use server'
import type { BuildFrameData, FramePayloadValidated } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import BasicView from '@/sdk/views/BasicView'
import type { Config, Storage } from '..'

export default async function success({
    body,
    config,
    storage,
    params,
}: {
    body: FramePayloadValidated
    config: Config
    storage: Storage
    params: any
}): Promise<BuildFrameData> {
    if (!config.successType || config.successType === 'disabled') {
        throw new FrameError('Frame not properly configured')
    }

    switch (config.successType) {
        case 'image': {
            if (!config.successImageUrl) {
                throw new FrameError('Success image not configured')
            }
            return {
                buttons: config.successButtons?.map((button) => ({ label: button.text })) || [],
                image: config.successImageUrl,
                handler: 'initial',
            }
        }

        case 'text': {
            if (!config.successStyling) {
                throw new FrameError('Success text styling not configured')
            }
            const roboto = await loadGoogleFontAllVariants('Roboto')
            return {
                buttons: config.successButtons?.map((button) => ({ label: button.text })) || [],
                fonts: roboto,
                component: BasicView(config.successStyling),
                handler: 'initial',
            }
        }

        case 'frame': {
            if (!config.successFrameUrl) {
                throw new FrameError('Success frame URL not configured')
            }

            return {
                frame: config.successFrameUrl,
            }
        }

        default:
            throw new FrameError('Frame not properly configured')
    }
}