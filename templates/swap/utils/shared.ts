type ImageLoaderProps = {
    src: string
    width: number
    quality?: number
}

export function coingeckoImageLoader({ src, width, quality }: ImageLoaderProps) {
    return `${src}&w=${width}&q=${quality || 75}`
}

export function formatSymbol(amount: string | number, symbol: string) {
    const regex = /(USDT|USDC|DAI)/
    if (regex.test(symbol)) {
        return `$${amount}`
    }

    return `${amount} ${symbol}`
}
