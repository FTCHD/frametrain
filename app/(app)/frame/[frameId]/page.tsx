import FrameEditor from '@/components/FrameEditor'
import { getFrame } from '@/lib/actions'
import templates from '@/templates'

export const runtime = 'edge'


export async function generateMetadata({ params }: { params: { frameId: string } }) {
    const frame = await getFrame(params.frameId)
    return {
        title: frame.name,
    }
}

export default async function FrameTemplatePage({ params }: { params: { frameId: string } }) {
    const frame = await getFrame(params.frameId)

    const currentTemplate = templates[frame.template]

    return <FrameEditor frame={frame} template={currentTemplate} />
}
