export function generateSocialCard({
    title,
    img,
}: {
    title: string
    img: string
}) {
    const baseUrl =
        'https://social-images.lu.ma/cdn-cgi/image/format=auto,fit=cover,dpr=1,quality=75,width=800,height=419/api/event-one'
    const url = new URL(baseUrl)

    const params: Record<string, string> = {
        color0: '#6c5041',
        color1: '#271917',
        color2: '#af9b85',
        color3: '#cdd0d1',
        name: title,
        img,
    }

    for (const key in params) {
        url.searchParams.append(key, params[key])
    }

    return url.toString()
}
