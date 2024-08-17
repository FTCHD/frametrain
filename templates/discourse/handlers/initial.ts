'use server'
import type { BuildFrameData } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import { unstable_cache } from 'next/cache'
import type { Config } from '..'
import CoverView from '../views/Cover'

export default async function initial({ config }: { config: Config }): Promise<BuildFrameData> {
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
        component: await buildCoverView(
            config.title,
            thread.posts_count,
            thread.views,
            config.backgroundColor,
            config.highlightColor,
            config.highlightFont
        ),

        // CoverView({
        //     title: config.title,
        //     postCount: thread.posts_count,
        //     viewCount: thread.views,
        //     backgroundColor: config.backgroundColor,
        //     highlightColor: config.highlightColor,
        //     highlightFont: config.highlightFont,
        // }),
        handler: 'post',
    }
}

const buildCoverView = unstable_cache(
    async (title, postCount, viewCount, backgroundColor, highlightColor, highlightFont) => {
        return CoverView({
            title,
            postCount,
            viewCount,
            backgroundColor,
            highlightColor,
            highlightFont,
        })
    }
)
