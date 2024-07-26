export function formatSymbol(amount: string | number, symbol: string) {
    const regex = /(USDT|USDC|DAI)/
    if (regex.test(symbol)) {
        return `$${amount}`
    }

    return `${amount} ${symbol}`
}
