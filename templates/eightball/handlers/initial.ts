'use server'
import type { BuildFrameData } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { HandlerContext } from '../types'
import CoverView from '../views/cover'

export default async function initial({
    config,
    storage,
}: Omit<HandlerContext, 'body'>): Promise<BuildFrameData> {
    const roboto = await loadGoogleFontAllVariants('Roboto')

    return {
        buttons: [{ label: 'Ask' }],
        inputText: 'Ask a question...',
        fonts: roboto,
        component: CoverView(config),
        handler: 'ask',
    }
}
