import { client } from '@/db/client'
import { frameTable } from '@/db/schema'
import { buildPreviewFramePage } from '@/lib/serve'
import type { BaseConfig, BaseStorage } from '@/lib/types'
import templates from '@/templates'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const fetchCache = 'force-no-store'

export async function GET(request: NextRequest, { params }: { params: { frameId: string } }) {
    const searchParams: Record<string, string> = {}

    request.nextUrl.searchParams.forEach((value, key) => {
        if (!['frameId', 'handler'].includes(key)) {
            searchParams[key] = value
        }
    })

    const frame = await client
        .select()
        .from(frameTable)
        .where(eq(frameTable.id, params.frameId))
        .get()

    if (!frame) {
        notFound()
    }

    const template = templates[frame.template]

    const { initial } = template.functions

    const buildParameters = await initial({
        body: undefined,
        config: frame.draftConfig as BaseConfig,
        storage: frame.storage as BaseStorage,
        params: searchParams,
    })

    const renderedFrame = await buildPreviewFramePage({
        id: frame.id,
        ...buildParameters,
    })

    return new Response(renderedFrame, {
        headers: {
            'Content-Type': 'text/html',
        },
    })
}
