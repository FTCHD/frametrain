'use server'
import type { BuildFrameData, FrameButtonMetadata } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config } from '..'
import { formatSymbol } from '../common/shared'
import CoverView from '../views/Cover'
import EstimateView from '../views/Estimate'

export default async function initial({
    config,
}: {
    config: Config

    body?: undefined
    storage?: Storage
    params?: any
}): Promise<BuildFrameData> {
    const buttons: FrameButtonMetadata[] = []
    const roboto = await loadGoogleFontAllVariants('Roboto')
    const fonts = [...roboto]

    if (config.coverMessage?.font) {
        const customMessageFont = await loadGoogleFontAllVariants(config.coverMessage.font)
        fonts.push(...customMessageFont)
    }

    if (config.pairName?.font) {
        const pairNameFont = await loadGoogleFontAllVariants(config.pairName.font)
        fonts.push(...pairNameFont)
    }

    if (config.pool) {
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

    return {
        buttons,
        fonts,
        component: CoverView(config),
    }
}
