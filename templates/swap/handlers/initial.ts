'use server'
import type { BuildFrameData, FrameButtonMetadata } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, Storage } from '..'
import { formatSymbol } from '../common/shared'
import CoverView from '../views/Cover'
import EstimateView from '../views/Estimate'

export default async function initial({
    config: { pool, ...config },
    storage,
}: {
    config: Config

    body?: undefined
    storage?: Storage
    params?: any
}): Promise<BuildFrameData> {
    const buttons: FrameButtonMetadata[] = []
    // try {
    const roboto = await loadGoogleFontAllVariants('Roboto')
    const fonts = [...roboto]
    let newStorage = storage

    if (config.coverMessage?.font) {
        const customMessageFont = await loadGoogleFontAllVariants(config.coverMessage.font)
        fonts.push(...customMessageFont)
    }

    if (config.pairName?.font) {
        const pairNameFont = await loadGoogleFontAllVariants(config.pairName.font)
        fonts.push(...pairNameFont)
    }

    if (pool) {
        const customFonts = await Promise.all([
            loadGoogleFontAllVariants('Inter'),
            loadGoogleFontAllVariants('Nunito'),
        ])

        fonts.push(...customFonts.flat())

        buttons.push({
            label: 'Buy',
        })

        const token0 = pool.primary === 'token0' ? pool.token0 : pool.token1
        const token1 = pool.primary === 'token0' ? pool.token1 : pool.token0

        for (const amount of config.amounts) {
            buttons.push({
                label: formatSymbol(amount, token1.symbol),
            })
        }

        let price = 0
        const token0ToUsd: { price: number; lastUpdated: number } | undefined =
            storage?.tokenToUsd?.[token0.symbol.toLowerCase()]
        
        const fetchUsdPrice = async (symbol: string) => {
            try {
                const request = await fetch(
                    `https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd`
                )
                const res = (await request.json()) as {
                    [key: string]: {
                        usd: number
                    }
                }
                const price = res[symbol].usd
                return price
            } catch {
                return 0
            }
        }

        if (token0ToUsd) {
            const lastUpdated = token0ToUsd.lastUpdated
            const diff = (Date.now() - lastUpdated) / 60000

            if (diff >= 10) {
                price = await fetchUsdPrice(token0.symbol.toLowerCase())
            }
        } else {
            price = await fetchUsdPrice(token0.symbol.toLowerCase())
            newStorage = {
                ...storage,
                tokenToUsd: {
                    ...storage?.tokenToUsd,
                    [token0.symbol.toLowerCase()]: {
                        price,
                        lastUpdated: Date.now(),
                    },
                },
            }
        }

        return {
            storage: newStorage,
            buttons,
            inputText: `Buy ${token1.symbol} amount (eg. 0.1)`,
            fonts,
            component: EstimateView({
                token0,
                token1,
                price,
                network: pool.network.name,
                ...config,
            }),
            handler: 'estimate',
        }
    }

    return {
        buttons,
        fonts,
        component: CoverView(config),
    }
    // } catch (e) {
    //     const error = e as Error
    //     throw new FrameError(error.message)
    // }
}
