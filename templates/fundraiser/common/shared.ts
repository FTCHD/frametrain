import { type Chain, createGlideConfig } from '@paywithglide/glide-js'

export function getGlideConfig(chain: Chain) {
    return createGlideConfig({
        projectId: process.env.GLIDE_PROJECT_ID ?? '',
        chains: [chain],
    })
}

export function formatSymbol(amount: string | number, symbol: string) {
    const regex = /(USDT|USDC|DAI)/
    if (regex.test(symbol)) {
        return `$${amount}`
    }

    return `${amount} ${symbol}`
}
