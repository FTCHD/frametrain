import path from 'path'
import { client } from '@/db/client'
import { frameTable } from '@/db/schema'
import { buildFramePage } from '@/lib/serve'
import type { BaseConfig, BaseStorage } from '@/lib/types'
import templates from '@/templates'
import { eq } from 'drizzle-orm'
import { readFile } from 'fs/promises'
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

    const { initial } = template.handlers

    // const initial = await import(`@/templates/${frame.template}/handlers/initial`).then(
    //     (t) => t.default
    // )

    const buildParameters = await initial({
        body: undefined,
        config: frame.config as BaseConfig,
        storage: frame.storage as BaseStorage,
        params: searchParams,
    })

    const hasPage = await readFile(
        path.join(process.cwd(), 'templates', frame.template, 'Page.tsx'),
        'utf-8'
    )
        .then((s) => !!s)
        .catch(() => false)

    const renderedFrame = await buildFramePage({
        id: frame.id,
        buttons: buildParameters.buttons,
        aspectRatio: buildParameters.aspectRatio,
        inputText: buildParameters.inputText,
        refreshPeriod: buildParameters.refreshPeriod,
        params: buildParameters.params,
        fonts: buildParameters.fonts,
        component: buildParameters.component,
        image: buildParameters.image,
        handler: buildParameters.handler,
        linkedPage: hasPage
            ? `${process.env.NEXT_PUBLIC_HOST}/f/${frame.id}/show`
            : frame.linkedPage || undefined,
    })

    return new Response(renderedFrame, {
        headers: {
            'Content-Type': 'text/html',
        },
    })
}
