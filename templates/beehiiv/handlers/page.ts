'use server'
import type { BuildFrameData, FrameButtonMetadata, FramePayloadValidated } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config } from '..'
import PageView from '../views/Page'
import initial from './initial'

export default async function page({
    body,
    config,
    params,
}: {
    body: FramePayloadValidated
    config: Config
    params: any
}): Promise<BuildFrameData> {
    const nextPage =
        params?.currentPage !== undefined
            ? body.tapped_button.index === 1
                ? Number(params?.currentPage) - 1
                : Number(params?.currentPage) + 1
            : 1

    const slideCount = (config.article?.pages ?? []).length || 1

    //console.log('slide count', slideCount)

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

    if (config.article?.url && (config.showLinkOnAllPages || nextPage === slideCount)) {
        buttons.push({
            label: 'Beehiiv',
            action: 'link',
            target: config.article.url,
        })
    }

    if (body.tapped_button.index === 1 && nextPage === 0) {
        return initial({ config })
    }

    const page = config.article?.pages[nextPage - 1]
    const georgia = await loadGoogleFontAllVariants('Georgia')

    return {
        buttons: buttons,
        aspectRatio: '1:1',
        fonts: georgia,
        component: PageView({
            page: page || [],
            currentPage: nextPage,
            slideCount: slideCount,
            pagesBgColor: config.pagesBgColor,
            pagesTextColor: config.pagesTextColor,
            pagesFontSize: config.pagesFontSize,
        }),
        handler: 'page',
        params: {
            currentPage: nextPage,
        },
    }
}
