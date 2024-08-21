'use server'
import type { BuildFrameData, FrameButtonMetadata } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config } from '..'
import CoverView from '../views/Cover'
import EstimateView from '../views/Estimate'
import { formatSymbol } from '../utils/shared'
import initial from './initial'

export default async function start({
    config,
    body,
    storage,
}: {
    config: Config

    body?: undefined
    storage?: undefined
    params?: any
}): Promise<BuildFrameData> {
    const buttons: FrameButtonMetadata[] = []
    const roboto = await loadGoogleFontAllVariants('Roboto')
    const fonts = [...roboto]

    if (!config.pool) {
        return initial({ config, body, storage })
    }

    const customFonts = await Promise.all([
        loadGoogleFontAllVariants('Inter'),
        loadGoogleFontAllVariants('Nunito'),
    ])

    fonts.push(...customFonts.flat())

    buttons.push({
        label: 'Buy',
    })

    const token0 = config.pool.primary === 'token0' ? config.pool.token0 : config.pool.token1
    const token1 = config.pool.primary === 'token0' ? config.pool.token1 : config.pool.token0

    for (const amount of config.amounts) {
        buttons.push({
            label: formatSymbol(amount, token1.symbol),
        })
    }

    return {
        buttons,
        inputText: `Buy ${token1.symbol} amount (eg. 0.1)`,
        fonts,
        component: EstimateView({ token0, token1, network: config.pool.network }),
        handler: 'estimate',
    }
}
