
export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export async function POST(req: Request) {
    const data = (await req.json()) as any
    try {
        const response = await fetch(data.url)
        const text = await response.text()
        return Response.json({ html: text }, { status: 200 })
    } catch (error) {
        console.error('Error fetching frame:', error)
        return Response.json({}, { status: 500, statusText: 'Internal Server Error' })
    }
}


