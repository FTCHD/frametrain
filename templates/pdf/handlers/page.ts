'use server'
import type { BuildFrameData, FrameActionPayload, FrameButtonMetadata } from '@/lib/farcaster'
import type { Config } from '..'
import initial from './initial'

export default async function page({
    body,
    config,
    params,
}: {
    body: FrameActionPayload
    config: Config
    params: any
}): Promise<BuildFrameData> {
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

    if (body.untrustedData.buttonIndex === 1 && nextPage === 0) {
        return initial({ config })
    }

    const slideUrl = config.slideUrls[nextPage - 1]

    return {
        buttons: buttons,
        aspectRatio: config.aspectRatio === '1.91/1' ? '1.91:1' : '1:1',
        image: process.env.NEXT_PUBLIC_CDN_HOST + slideUrl,
        handler: 'page',
        params: {
            currentPage: nextPage,
        },
    }
}
