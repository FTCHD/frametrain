import { supportedChains } from '@/sdk/viem'

export function formatSymbol(amount: string | number, symbol: string) {
    const regex = /(USDT|USDC|DAI)/
    if (regex.test(symbol)) {
        return `$${amount}`
    }

    return `${amount} ${symbol}`
}

export const uniswapChains = supportedChains.filter((chain) =>
    ['mainnet', 'optimism', 'arbitrum', 'base', 'polygon'].includes(chain.key)
)
