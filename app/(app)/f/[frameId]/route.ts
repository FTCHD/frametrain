import { frameTable } from '@/db/schema'
import templates from '@/templates'
import { getRequestContext } from '@cloudflare/next-on-pages'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import { notFound } from 'next/navigation'

export const dynamic = 'auto'
export const dynamicParams = true
export const runtime = 'edge'

export async function GET(request: Request, { params }: { params: { frameId: string } }) {
    const db = drizzle(getRequestContext().env.DB)

    const frame = await db.select().from(frameTable).where(eq(frameTable.id, params.frameId)).get()

    if (!frame) {
        notFound()
    }

    const template = templates[frame.template]

    console.log('Got template', JSON.stringify(template).substring(0, 20))

    console.log('Handlers list', template.functions)

    const { initial } = template.functions

    return new Response(
        await initial({ ...frame.config, frameId: frame.id } as typeof template.initialConfig),
        {
            headers: {
                'Content-Type': 'text/html',
            },
        }
    )
}
