'use server'
import type { BuildFrameData, FrameButtonMetadata } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, Storage } from '..'
import PageView from '../views/Page'
import initial from './initial'

export default async function page({
    body,
    config,
    storage,
    params,
}: {
    body: FramePayloadValidated
    config: Config
    storage: Storage
    params: any
}): Promise<BuildFrameData> {
    const nextPage =
        params?.currentPage !== undefined
            ? body.tapped_button.index === 1
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

    if (body.tapped_button.index === 2 && nextPage === tweetCount) {
        buttons.push({
            label: 'Create Your Own',
            action: 'link',
            target: 'https://frametra.in',
        })
    }

    if (body.tapped_button.index === 1 && nextPage === 0) {
        return initial({ config })
    }

    const tweet = config.tweets[nextPage - 1]
    const fonts = await loadGoogleFontAllVariants(tweet?.fontFamily ?? 'Roboto')

    return {
        buttons: buttons,
        aspectRatio: '1.91:1',
        fonts,
        component: PageView({
            profile: config.profile,
            ...tweet,
        } as any),
        handler: 'page',
        params: {
            currentPage: nextPage,
        },
    }
}
