import { frameTable } from '@/db/schema'
import { updateFrameCalls, updateFramePreview, updateFrameState } from '@/lib/frame'
import type { FrameActionPayload, FrameActionPayloadUnion } from '@/lib/farcaster'
import type { BaseConfig, BaseState } from '@/lib/types'
import templates from '@/templates'
import { getRequestContext } from '@cloudflare/next-on-pages'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import ms from 'ms'
import { notFound } from 'next/navigation'
import type { NextRequest } from 'next/server'
import { buildPreviewFramePage } from '@/lib/serve'

export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const runtime = 'edge'
export const fetchCache = 'force-no-store'

export async function POST(
    request: NextRequest,
    { params }: { params: { frameId: string; functionName: string } }
) {
    const searchParams: Record<string, string> = {}

    request.nextUrl.searchParams.forEach((value, key) => {
        if (!['frameId', 'functionName'].includes(key)) {
            searchParams[key] = value
        }
    })

    const db = drizzle(getRequestContext().env.DB)

    const frame = await db.select().from(frameTable).where(eq(frameTable.id, params.frameId)).get()

    if (!frame) {
        notFound()
    }

    if (!frame.config) {
        notFound()
    }

    const template = templates[frame.template]

    let body: FrameActionPayload | FrameActionPayloadUnion =
        (await request.json()) as FrameActionPayload

    type ValidSlide = Omit<typeof template.functions, 'initial'>

    const handler = template.functions[params.functionName as keyof ValidSlide]

    if (!handler) {
        notFound()
    }

    const buildParameters = await handler(
        body,
        frame.draftConfig as BaseConfig,
        frame.state as BaseState,
        searchParams
    )
	
	const { frame: renderedFrame } = await buildPreviewFramePage({ id: frame.id, ...buildParameters })

	if (frame.updatedAt.getTime() < Date.now() - ms('5m')) {
		await updateFramePreview(frame.id, renderedFrame)
	}

    return new Response(renderedFrame, {
        headers: {
            'Content-Type': 'text/html',
        },
    })
}
