'use server'
import type { FrameActionPayload } from '@/lib/farcaster'
import { buildFramePage } from '@/lib/sdk'
import type { ReactElement, ReactNode } from 'react'
import { dimensionsForRatio } from '@/lib/constants'
import type { Config, State } from '..'
import { ImageResponse } from '@vercel/og'

export default async function page(
    body: FrameActionPayload,
    config: Config,
    state: State,
    params: any
) {
    const frameImage = 'https://placehold.co/1920x1005?text=Hello+World'

   
	const r = new ImageResponse( ({
		type: 'div',
		props: {
			children: 'hello, world',
			style: { color: 'black' },
		},
	} as ReactElement), {
        ...dimensionsForRatio['1.91/1'],
    })

    // get image data from vercel/og ImageResponse
    const bufferData = Buffer.from(await r.arrayBuffer())
    const imageData = bufferData.toString('base64')

    return {
        frame: await buildFramePage({
            buttons: [
                {
                    label: 'Green',
                },
                {
                    label: 'Purple',
                },
                {
                    label: 'Red',
                },
                {
                    label: 'Blue',
                },
            ],
            image: 'data:image/png;base64,' + imageData,
            aspectRatio: '1.91:1',
            config: config,
            function: 'results',
            params: { currentPage: 1 },
        }),
        state: state,
    }
}
