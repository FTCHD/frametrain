import { getMockFrameRequest } from '@coinbase/onchainkit/frame'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export async function POST(req: Request) {
    const data = (await req.json()) as any

    console.log('POSTED', JSON.stringify(data))

    const { frameData, options } = data
    const postUrl = frameData.url
    const debugPayload = getMockFrameRequest(
        { untrustedData: frameData, trustedData: { messageBytes: '' } },
        options
    )

    const res = await fetch(postUrl, {
        method: 'POST',
        body: JSON.stringify(debugPayload),
        redirect: 'manual',
    })

    // if (res.status === 302) {
    //     const redirectUrl = res.headers.get('Location')
    //     return Response.json({ redirectUrl })
    // }

    const html = await res.text()

    console.log('HTML', JSON.stringify(html).substring(0, 20))

    return Response.json({ html })
}
