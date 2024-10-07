'use server'
import type { BuildFrameData } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, State } from '..'
import CoverView from '../views/Cover'

export default async function initial(config: Config, state: State): Promise<BuildFrameData> {
    const roboto = await loadGoogleFontAllVariants('Roboto')

    return {
        buttons: [
            {
                label: 'Metamask',
                action: 'link',
                target: `https://metamask.app.link/send/${config.address}`,
            },
            {
                label: 'Coinbase',
                action: 'link',
                target: 'https://go.cb-w.com/',
            },
            {
                label: 'OKX',
                action: 'link',
                target: 'okx://wallet/dapp/',
            },
            {
                label: 'Bitget',
                action: 'link',
                target: 'https://bkcode.vip/',
            },
        ],
        fonts: roboto,
        component: CoverView(config),
        functionName: 'page',
    }
}
