'use server'
import { dimensionsForRatio } from '@/lib/constants'
import type { FrameActionPayload, FrameButtonMetadata } from '@/lib/farcaster'
import { buildFramePage } from '@/lib/sdk'
import { ImageResponse } from '@vercel/og'
import type { Config, State } from '..'
import PageView from '../views/Page'
import initial from './initial'

export default async function page(
    body: FrameActionPayload,
    config: Config,
    state: State,
    params: any
) {
    const nextPage =
        params?.currentPage !== undefined
            ? body.untrustedData.buttonIndex === 1
                ? Number(params?.currentPage) - 1
                : Number(params?.currentPage) + 1
            : 1

    const slideCount = config.slideUrls.length

    const buttons: FrameButtonMetadata[] = [
        {
            label: '←',
        },
    ]

    if (nextPage < slideCount) {
        buttons.push({
            label: '→',
        })
    }

    if (body.untrustedData.buttonIndex === 2 && nextPage === slideCount) {
        buttons.push({
            label: 'Create Your Own',
            action: 'link',
            target: 'https://frametra.in',
        })
    }

    let frame

    if (body.untrustedData.buttonIndex === 1 && nextPage === 0) {
        frame = await initial(config, state)
    } else {
        const slideUrl = config.slideUrls[nextPage - 1]

        const r = new ImageResponse(
            PageView({
                slideUrl: slideUrl,
                sizes: dimensionsForRatio[config.aspectRatio as keyof typeof dimensionsForRatio],
            }),
            {
                ...dimensionsForRatio[config.aspectRatio as keyof typeof dimensionsForRatio],
            }
        )

        // get image data from vercel/og ImageResponse
        const bufferData = Buffer.from(await r.arrayBuffer())
        const imageData = bufferData.toString('base64')

        frame = await buildFramePage({
            buttons: buttons,
            image: 'data:image/png;base64,' + imageData,
            aspectRatio: config.aspectRatio.replace('/', ':'),
            config: config,
            function: 'page',
            params: {
                currentPage: nextPage,
            },
        })
    }

    return {
        frame: frame,
        state: state,
    }
}
