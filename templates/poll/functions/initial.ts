'use server'
import { dimensionsForRatio } from '@/lib/constants'
import { loadGoogleFontAllVariants } from '@/lib/fonts'
import { buildFramePage } from '@/lib/sdk'
import { ImageResponse } from '@vercel/og'
import type { Config, State } from '..'
import VoteView from '../views/Vote'

export default async function initial(config: Config, state: State) {
    const roboto = await loadGoogleFontAllVariants('Roboto')

    const r = new ImageResponse(VoteView(config), {
        ...dimensionsForRatio['1.91/1'],
        fonts: roboto,
    })

    // get image data from vercel/og ImageResponse
    const bufferData = Buffer.from(await r.arrayBuffer())
    const imageData = bufferData.toString('base64')

    return buildFramePage({
        buttons: config?.options?.map((option) => ({
            label: option.buttonLabel,
        })),
        image: 'data:image/png;base64,' + imageData,
        config: config,
        aspectRatio: '1.91:1',
        function: 'vote',
    })
}
