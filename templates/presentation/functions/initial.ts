'use server'
import type { BuildFrameData, FrameButtonMetadata } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import CoverView from '../views/Cover'
import type { Config } from '..'

export default async function initial(config: Config): Promise<BuildFrameData> {
    const inter = await loadGoogleFontAllVariants('Inter')

    const texts: string[] = config.content?.text || []
    const title: string = config.title?.text || ''
    const buttons: FrameButtonMetadata[] = []

    let maxPage = texts?.length + (title ? 1 : 0)
    if (config?.type === "image") maxPage = config?.images?.length;

    if (maxPage > 1)
        buttons.push({
            label: '→',
        })

    return {
        buttons,
        fonts: inter,
        aspectRatio: config?.type === "image" ? (config?.aspect || '1:1') : '1:1',
        component: CoverView(config),
        functionName: 'page',
    }
}
