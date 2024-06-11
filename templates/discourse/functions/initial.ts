'use server'
import type { BuildFrameData } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, State } from '..'
import CoverView from '../views/Cover'

export default async function initial(config: Config, state: State): Promise<BuildFrameData> {
    const font = await loadGoogleFontAllVariants(config.highlightFont || 'Urbanist')

    const thread = await fetch(config.discourseJson)
        .then((res) => res.json())
        .catch(console.error)

    return {
        buttons: [
            {
                label: 'Read',
            },
            {
                label: 'Latest Post',
            },
            {
                label: 'View',
                action: 'link',
                target: config.discourseLink,
            },
        ],
        aspectRatio: '1.91:1',
        fonts: font,
        component: CoverView({
            title: config.title,
            postCount: thread.posts_count,
            viewCount: thread.views,
            backgroundColor: config.backgroundColor,
            highlightColor: config.highlightColor,
            highlightFont: config.highlightFont,
        }),
        functionName: 'post',
    }
}
