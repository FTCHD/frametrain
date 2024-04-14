'use server'
import { dimensionsForRatio } from '@/lib/constants'
import { loadGoogleFontAllVariants } from '@/lib/fonts'
import { buildFramePage } from '@/lib/sdk'
import { ImageResponse } from '@vercel/og'
import type { Config, State } from '..'
import CoverView from '../views/Cover'

export default async function initial(config: Config, state: State) {
    const roboto = await loadGoogleFontAllVariants('Roboto')

    const r = new ImageResponse(
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

    // get image data from vercel/og ImageResponse
    const bufferData = Buffer.from(await r.arrayBuffer())
    const imageData = bufferData.toString('base64')

    return buildFramePage({
        buttons: [
            {
                label: 'START',
            },
        ],
        image: 'data:image/png;base64,' + imageData,
        config: config,
        aspectRatio: '1:1',
        function: 'page',
    })
}
