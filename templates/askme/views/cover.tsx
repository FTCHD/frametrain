'use client'
import BasicView from '@/sdk/views/BasicView'
import type { Config } from '..'

export default function Cover({ config }: { config: Config }) {
    if (config.coverType === 'image') {
        return <img src={config.coverImage} alt="Cover" style={{ width: '100%', height: 'auto' }} />
    }

    return (
        <BasicView
            title={config.coverTitle}
            subtitle={config.coverSubtitle}
            bottomMessage={config.coverBottomMessage}
        />
    )
}
