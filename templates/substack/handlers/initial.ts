'use server'
import type { BuildFrameData } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config } from '..'
import CoverView from '../views/Cover'

export default async function initial({ config }: { config: Config }): Promise<BuildFrameData> {
    const georgia = await loadGoogleFontAllVariants('Georgia')

    return {
        buttons: [
            {
                label: 'Read →',
            },
        ],
        fonts: georgia,
        component: CoverView({
            article: config.article,
            bgColor: config.coverBgColor,
            textColor: config.coverTextColor,
            imageSize: config.imageSize,
            textPosition: config.textPosition,
            hideTitleAuthor: config.hideTitleAuthor,
        }),
        handler: 'page',
    }
}
