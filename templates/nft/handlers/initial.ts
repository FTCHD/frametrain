'use server'
import type { BuildFrameData } from '@/lib/farcaster'
import type { Config, Storage } from '../types'
import CoverView from '../views/Cover'

export default async function initial({
    config,
    storage,
}: {
    config: Config
    storage: Storage
}): Promise<BuildFrameData> {
    return {
        buttons: [
            { label: 'Buy NFTs', action: 'post' },
            { label: 'Sell NFTs', action: 'post' },
        ],
        image: config.coverImage,
        component: CoverView(config),
        handler: 'buy',
    }
}
