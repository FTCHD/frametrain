'use server'
import { dimensionsForRatio } from '@/lib/constants'
import type { FrameActionPayload } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/lib/fonts'
import { buildFramePage } from '@/lib/sdk'
import type { Config, State } from '..'
import PageView from '../views/Page'
import initial from './initial'
import { ImageResponse } from '@vercel/og'

export default async function page(
    body: FrameActionPayload,
    config: Config,
    state: State,
    params: any
) {
    console.log('PAGE HANDLER', body, config, state, params)

    const nextPage =
        params?.currentPage !== undefined
            ? body.untrustedData.buttonIndex === 1
                ? Number(params?.currentPage) - 1
                : Number(params?.currentPage) + 1
            : 1

    const tweetCount = config.tweets.length

    const buttons = [
        {
            label: '<',
        },
    ]

    if (nextPage < tweetCount) {
        buttons.push({
            label: '>',
        })
    }

    if (body.untrustedData.buttonIndex === 2 && nextPage === tweetCount) {
        buttons.push({
            label: 'Create Your Own',
        })
    }

    let frame

    if (body.untrustedData.buttonIndex === 1 && nextPage === 0) {
        frame = await initial(config, state)
    } else {
        const roboto = await loadGoogleFontAllVariants('Roboto')

        const pageData = config.tweets[nextPage - 1]

		
		const r = new ImageResponse( PageView({
			profile: config.profile,
			content: pageData.content,
		}), {
			...dimensionsForRatio['1.91/1'],
			fonts: roboto,
		})
	
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
