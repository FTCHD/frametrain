import BasicView from '@/sdk/views/BasicView'
import type { Config } from '../types'

export default function Submitted({ config }: { config: Config }) {
    if (config.submittedType === 'image') {
        return (
            <img
                src={config.submittedImage}
                alt="Submitted"
                style={{ width: '100%', height: 'auto' }}
            />
        )
    }

    return (
        <BasicView
            title={config.submittedTitle}
            subtitle={config.submittedSubtitle}
            bottomMessage={config.submittedBottomMessage}
        />
    )
}
