import type { PortfolioToken } from '../types'
import { getTokenBalances, getTokenPrices } from './0xApiUtils'

export async function fetchPortfolioData(
    address: string,
    chainId: number
): Promise<{ totalValue: string; tokens: PortfolioToken[] }> {
    const balances = await getTokenBalances(address, chainId)
    const prices = await getTokenPrices(
        balances.map((b) => b.address),
        chainId
    )

    const portfolioTokens: PortfolioToken[] = balances.map((balance) => {
        const price = prices[balance.address]
        const value = (Number(balance.balance) / 10 ** balance.decimals) * price
        return {
            ...balance,
            percentage: 0,
            value: value.toString(),
        }
    })

    const totalValue = portfolioTokens.reduce((sum, token) => sum + Number(token.value), 0)

    return {
        totalValue: totalValue.toFixed(2),
        tokens: portfolioTokens.map((token) => ({
            ...token,
            percentage: (Number(token.value) / totalValue) * 100,
        })),
    }
}
