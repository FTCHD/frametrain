'use server'
import type { BuildFrameData } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config } from '..'
import CoverView from '../views/Cover'

export default async function initial(config: Config): Promise<BuildFrameData> {
    const georgia = await loadGoogleFontAllVariants('Georgia')

    return {
        buttons: [
            {
                label: 'Read →',
            },
        ],
        aspectRatio: '1:1',
        fonts: georgia,
        component: CoverView({
            article: config.article,
            textColor: config.textColor,
            bgBlendMode: config.bgBlendMode,
            hideTitleAuthor: config.hideTitleAuthor
        }),
        functionName: 'page',
    }
}
