import { auth } from '@/auth'
import ComposeEditor from '@/components/compose/ComposeEditor'
import { getFrame } from '@/lib/frame'
import templates from '@/templates'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export async function generateMetadata({
    params,
}: { params: { frameId: string } }): Promise<Metadata> {
    const frame = await getFrame(params.frameId)
    return {
        title: frame.name,
        robots: 'noindex',
    }
}

export default async function InspectorTemplatePage({
    params,
    searchParams,
}: {
    params: { frameId: string }
    searchParams: Record<string, string>
}) {
    const sesh = await auth()

    if (!sesh?.user) {
        redirect('/')
    }

    const frame = await getFrame(params.frameId)

    if (frame.owner !== sesh.user.id) {
        redirect('/')
    }

    const { s: serializedState } = searchParams

    const deserializedState = JSON.parse(decodeURIComponent(serializedState))

    const currentTemplate = templates[frame.template]

    return (
        <ComposeEditor
            frame={frame}
            template={currentTemplate}
            fid={sesh.user.id}
            castState={deserializedState.cast}
        />
    )
}
