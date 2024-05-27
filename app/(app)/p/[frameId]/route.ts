import { client } from '@/db/client'
import { frameTable } from '@/db/schema'
import { buildPreviewFramePage } from '@/lib/serve'
import templates from '@/templates'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const fetchCache = 'force-no-store'

export async function GET(request: Request, { params }: { params: { frameId: string } }) {
    const frame = await client.select().from(frameTable).where(eq(frameTable.id, params.frameId)).get()

    if (!frame) {
        notFound()
    }

    const template = templates[frame.template]

    const { initial } = template.functions

    const buildParameters = await initial(frame.draftConfig, frame.state)

    const { frame: renderedFrame } = await buildPreviewFramePage({
        id: frame.id,
        ...buildParameters,
    })

    return new Response(renderedFrame, {
        headers: {
            'Content-Type': 'text/html',
        },
    })
}
