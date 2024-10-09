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
    if (!config?.coverType || config.coverType === 'disabled') {
        return await cover({ body, config, storage, params })
    }

    if (config.coverType === 'image') {
        if (!config.coverImageUrl) {
            throw new FrameError('No image set')
        }

        return {
            buttons: config?.coverButtons?.map((button) =>
                button.type === 'link'
                    ? {
                          label: button.text,
                          action: 'link',
                          target: button.target,
                      }
                    : {
                          label: button.text,
                      }
            ),
            aspectRatio: config.coverAspectRatio,
            image: config.coverImageUrl,
            handler: 'slide',
        }
    }

    const roboto = await loadGoogleFontAllVariants('Roboto')

    return {
        buttons: config?.coverButtons?.map((button) =>
            button.type === 'link'
                ? {
                      label: button.text,
                      action: 'link',
                      target: button.target,
                  }
                : {
                      label: button.text,
                  }
        ),
        aspectRatio: config.coverAspectRatio,
        fonts: roboto,
        component: BasicView(config.coverStyling),
        handler: 'slide',
        params: {
            currentSlide: 0,
        },
    }
}
