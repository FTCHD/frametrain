import { createGlideConfig, chains, type Chain } from '@paywithglide/glide-js'

export const glideConfig = createGlideConfig({
    projectId: process.env.GLIDE_PROJECT_ID ?? '',

    chains: [chains.arbitrum, chains.optimism, chains.base],
})

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
