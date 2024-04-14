'use server'
import { dimensionsForRatio } from '@/lib/constants'
import { loadGoogleFontAllVariants } from '@/lib/fonts'
import { buildFramePage } from '@/lib/sdk'
import satori from 'satori'
import type { Config, State } from '..'
import CoverView from '../views/Cover'

export default async function initial(config: Config, state: State) {
    const roboto = await loadGoogleFontAllVariants('Roboto')

    const reactSvg = await satori(
        CoverView({
            title: config.title,
            subtitle: config.subtitle,
            backgroundColor: config.backgroundColor,
            textColor: config.textColor,
        }),
        {
            ...dimensionsForRatio['1/1'],
            fonts: roboto,
        }
    )

    return buildFramePage({
        buttons: [
            {
                label: 'START',
            },
        ],
        image: 'data:image/svg+xml;base64,' + Buffer.from(reactSvg).toString('base64'),
        config: config,
        aspectRatio: '1:1',
        function: 'page',
    })
}