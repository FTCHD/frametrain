
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
    const frame = await getFrame(params.frameId)
	
	const sesh = await auth()
    const currentUserId = sesh?.user?.id

    if (frame.owner !== currentUserId) {
        redirect('/')
    }
	
    const currentTemplate = templates[frame.template]

    return <FrameEditor frame={frame} template={currentTemplate} />
}
