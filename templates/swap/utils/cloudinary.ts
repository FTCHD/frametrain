type ImageLoaderProps = {
    src: string
    width: number
    quality?: number
}

const normalizeSrc = (src: string) => (src[0] === '/' ? src.slice(1) : src)

export function cloudinaryFetchLoader({ src, width, quality }: ImageLoaderProps) {
    const params = ['f_auto', 'c_limit', `w_${width}`, `q_${quality || 'auto'}`]
    return `https://cdn.sushi.com/image/fetch/${params.join(',')}/${normalizeSrc(src)}`
}

export function cloudinaryImageLoader({ src, width, quality }: ImageLoaderProps) {
    const params = ['f_auto', 'c_limit', `w_${width}`, `q_${quality || 'auto'}`]
    return `https://cdn.sushi.com/image/upload/${params.join(',')}/${normalizeSrc(src)}`
}

export function cloudinaryLogoFetchLoader({ src, width, quality: _quality }: ImageLoaderProps) {
    const params = [
        'f_auto',
        'c_limit',
        `w_${width}`,
        // `q_${quality || 'auto'}`
    ]
    return `https://cdn.sushi.com/image/fetch/${params.join(',')}/d_unknown.png/${normalizeSrc(
        src
    )}`
}

export function cloudinaryLogoImageLoader({ src, width, quality: _quality }: ImageLoaderProps) {
    const params = [
        'f_auto',
        'c_limit',
        `w_${width}`,
        // `q_${quality || 'auto'}`
    ]
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
