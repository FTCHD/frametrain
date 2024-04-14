'use server'
import { dimensionsForRatio } from '@/lib/constants'
import { loadGoogleFontAllVariants } from '@/lib/fonts'
import { buildFramePage } from '@/lib/sdk'
import type { Config, State } from '..'
import CoverView from '../views/Cover'
import { ImageResponse } from '@vercel/og'

export default async function initial(config: Config, state: State) {
    const roboto = await loadGoogleFontAllVariants('Roboto')
	
    const r = new ImageResponse(CoverView({ title: config.title, profile: config.profile }), {
        ...dimensionsForRatio['1.91/1'],
        fonts: roboto,
    })

    // get image data from vercel/og ImageResponse
    const bufferData = Buffer.from(await r.arrayBuffer())
    const imageData = bufferData.toString('base64')

    return buildFramePage({
        buttons: [
            {
                label: 'Begin',
            },
        ],
        image: 'data:image/png;base64,' + imageData,
        config: config,
        aspectRatio: '1.91:1',
        function: 'page',
    })
}
