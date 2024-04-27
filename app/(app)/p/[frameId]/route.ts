import { frameTable } from '@/db/schema'
import { buildPreviewFramePage } from '@/lib/serve'
import templates from '@/templates'
import { getRequestContext } from '@cloudflare/next-on-pages'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const runtime = 'edge'
export const fetchCache = 'force-no-store'

export async function GET(request: Request, { params }: { params: { frameId: string } }) {
    const db = drizzle(getRequestContext().env.DB)

    const frame = await db.select().from(frameTable).where(eq(frameTable.id, params.frameId)).get()

    if (!frame) {
        notFound()
    }

    const template = templates[frame.template]

    const { initial } = template.functions

	const buildParameters = await initial(frame.draftConfig, frame.state) 
	
	const { frame: renderedFrame } = await buildPreviewFramePage({ id: frame.id, ...buildParameters })

    return new Response(renderedFrame, {
        headers: {
            'Content-Type': 'text/html',
        },
    })
}
