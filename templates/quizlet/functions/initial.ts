'use server'
import type { BuildFrameData } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, State } from '..'
import CoverView from '../views/Cover'

export default async function initial(config: Config, _: State): Promise<BuildFrameData> {
    const roboto = await loadGoogleFontAllVariants(
        config.cover.configuration?.fontFamily ?? 'Roboto'
    )

    return {
        buttons: [{ label: config.cover.label }],
        fonts: roboto,
        component: config.cover.image
            ? undefined
            : CoverView({
                  text: config.cover.text,
                  configuration: config.cover.configuration,
              }),
        handler: 'page',
        image: config.cover.image,
        aspectRatio:
            config.cover.image && config.cover.aspectRatio !== undefined
                ? config.cover.aspectRatio === '1.91/1'
                    ? '1.91:1'
                    : '1:1'
                : undefined,
    }
}
