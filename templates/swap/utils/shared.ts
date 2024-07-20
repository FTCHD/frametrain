type ImageLoaderProps = {
    src: string
    width: number
    quality?: number
}

const normalizeSrc = (src: string) => (src[0] === '/' ? src.slice(1) : src)

export function cloudinaryLogoImageLoader({ src, width, quality: _quality }: ImageLoaderProps) {
    const params = ['f_auto', 'c_limit', `w_${width}`]
    return `https://cdn.sushi.com/image/upload/${params.join(',')}/d_unknown.png/${normalizeSrc(
        src
    )}`
}

export function generateTokenLogoUrl(chainId: number, address: string) {
    return cloudinaryLogoImageLoader({
        src: `tokens/${chainId}/${address}.jpg`,
        width: 36,
    })
}

export function formatSymbol(amount: string, symbol: string) {
    const regex = /(USDT|USDC|DAI)/
    if (regex.test(symbol)) {
        return `$${amount}`
    }

    return `${amount} ${symbol}`
}
