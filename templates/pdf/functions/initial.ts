'use server'
import { dimensionsForRatio } from '@/lib/constants'
import { loadGoogleFontAllVariants } from '@/lib/fonts'
import { buildFramePage } from '@/lib/sdk'
import satori from 'satori'
import type { Config, State } from '..'
import CoverView from '../views/Cover'

export default async function initial(config: Config, state: State) {
    const roboto = await loadGoogleFontAllVariants('Roboto')

    const reactSvg = await satori(CoverView(), {
        ...dimensionsForRatio[config.aspectRatio as keyof typeof dimensionsForRatio],
        fonts: roboto,
    })

    return buildFramePage({
        buttons: [
            {
                label: 'Begin',
            },
        ],
        image: 'data:image/svg+xml;base64,' + Buffer.from(reactSvg).toString('base64'),
        config: config,
        aspectRatio: config.aspectRatio,
        function: 'page',
    })
}
