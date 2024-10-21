'use server'
import type { BuildFrameData, FramePayloadValidated } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import { supportedChains } from '@/sdk/viem'
import type { Config, Storage } from '..'
import { fetchUser } from '../utils'
import InfoView from '../views/Info'

export default async function info({
    config,
    storage,
}: {
    body?: FramePayloadValidated
    config: Config
    storage: Storage
}): Promise<BuildFrameData> {
    if (!(config.owner && config.token?.chain && config.token?.symbol && config.address)) {
        throw new FrameError('Frame not fully configured')
    }

    const chain = supportedChains.find((chain) => chain.key === config.token?.chain)
    if (!chain) {
        throw new Error(`Unsupported chain: ${config.token!.chain}`)
    }

    const user = await fetchUser(config.owner.fid)
    const fonts = await loadGoogleFontAllVariants('Nunito Sans')

    return {
        buttons: [
            {
                label: 'Back',
            },
            {
                label: 'Buy Space',
            },
            {
                label: 'Manage',
            },
        ],
        component: InfoView({
            config,
            user,
            chainName: chain.label,
        }),
        handler: 'buy',
        fonts,
        storage,
    }
}
