import { auth } from '@/auth'
import FrameEditor from '@/components/FrameEditor'
import { getFrame } from '@/lib/frame'
import templates from '@/templates'
import { redirect } from 'next/navigation'

export async function generateMetadata({ params }: { params: { frameId: string } }) {
    const frame = await getFrame(params.frameId)
    return {
        title: frame.name,
    }
}

export default async function FrameTemplatePage({ params }: { params: { frameId: string } }) {
    const sesh = await auth()

    if (!sesh?.user) {
        redirect('/')
    }

    const frame = await getFrame(params.frameId)

    if (frame.owner !== sesh.user.id) {
        redirect('/')
    }

    const currentTemplate = templates[frame.template]

    return <FrameEditor frame={frame} template={currentTemplate} fid={sesh.user.id} />
}
