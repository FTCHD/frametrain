'use server'
import { dimensionsForRatio } from '@/lib/constants'
import type { FrameActionPayload, FrameButtonMetadata } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/lib/fonts'
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

    const tweetCount = config.tweets.length

    const buttons: FrameButtonMetadata[] = [
        {
            label: '←',
        },
    ]

    if (nextPage < tweetCount) {
        buttons.push({
            label: '→',
        })
    }

    if (body.untrustedData.buttonIndex === 2 && nextPage === tweetCount) {
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
        const tweet = config.tweets[nextPage - 1]

        const fonts = []

        const roboto = await loadGoogleFontAllVariants('Roboto')
        fonts.push(...roboto)

        if (tweet?.fontFamily) {
            const font = await loadGoogleFontAllVariants(tweet.fontFamily)
            fonts.push(...font)
        }

        const r = new ImageResponse(
            PageView({
                profile: config.profile,
                ...tweet,
            }),
            {
                ...dimensionsForRatio['1.91/1'],
                fonts: fonts,
            }
        )

        // get image data from vercel/og ImageResponse
        const bufferData = Buffer.from(await r.arrayBuffer())
        const imageData = bufferData.toString('base64')

        frame = await buildFramePage({
            buttons: buttons,
            image: 'data:image/png;base64,' + imageData,
            aspectRatio: '1.91:1',
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
