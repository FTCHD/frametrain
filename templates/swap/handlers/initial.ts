'use server'
import type { BuildFrameData, FrameButtonMetadata } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import ms from 'ms'
import type { Config, Storage } from '..'
import { fetchCoverPrice } from '../common/0x'
import { formatSymbol } from '../common/shared'
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
    const fontSet = new Set(['Roboto'])
    const fonts: any[] = []
    let newStorage = storage

    if (config.coverMessage?.fontFamily) {
        fontSet.add(config.coverMessage.fontFamily)
    }

    if (config.pairName?.fontFamily) {
        fontSet.add(config.pairName.fontFamily)
    }

    for (const font of fontSet) {
        const loadedFont = await loadGoogleFontAllVariants(font)
        fonts.push(...loadedFont)
    }

    if (pool) {
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
        const livePriceData: { price: number; lastUpdated: number } | undefined =
            storage?.livePriceData?.[token0.symbol.toLowerCase()]

        if (livePriceData) {
            if (Date.now() - livePriceData.lastUpdated >= ms('10')) {
                price = await fetchCoverPrice({
                    network: pool.network,
                    buyToken: token1,
                    sellToken: token0,
                })

                newStorage = {
                    ...storage,
                    livePriceData: {
                        ...storage?.livePriceData,
                        [token0.symbol.toLowerCase()]: {
                            price,
                            lastUpdated: Date.now(),
                        },
                    },
                }
            } else {
                price = livePriceData.price
            }
        } else {
            price = await fetchCoverPrice({
                network: pool.network,
                buyToken: token1,
                sellToken: token0,
            })

            newStorage = {
                ...storage,
                livePriceData: {
                    ...storage?.livePriceData,
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
        component: EstimateView(),
    }
}
