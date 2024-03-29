'use server'
import { dimensionsForRatio } from '@/lib/constants'
import type { FrameActionPayload } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/lib/fonts'
import { buildFramePage } from '@/lib/sdk'
import satori from 'satori'
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

    const slideCount = config.slides.length

    const buttons = [
        {
            label: '<',
        },
    ]

    if (nextPage < slideCount) {
        buttons.push({
            label: '>',
        })
    }

    if (body.untrustedData.buttonIndex === 2 && nextPage === slideCount) {
        buttons.push({
            label: 'Create Your Own',
        })
    }

    let frame

    if (body.untrustedData.buttonIndex === 1 && nextPage === 0) {
        frame = await initial(config, state)
    } else {
        const roboto = await loadGoogleFontAllVariants('Roboto')

        const pageData = config.slides[nextPage - 1]

        const r = await satori(
            PageView({
                // profile: config.profile,
                content: pageData,
                sizes: dimensionsForRatio[config.aspectRatio as keyof typeof dimensionsForRatio],
            }),
            {
                ...dimensionsForRatio[config.aspectRatio as keyof typeof dimensionsForRatio],
                fonts: roboto,
            }
        )

        frame = await buildFramePage({
            buttons: buttons,
            image: 'data:image/svg+xml;base64,' + Buffer.from(r).toString('base64'),
            aspectRatio: config.aspectRatio,
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
