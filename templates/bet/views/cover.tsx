'use client'
import BasicView from '@/sdk/views/BasicView'
import type { Config, Storage } from '..'

export default function CoverView(config: Config, storage: Storage) {
    const title = config.isPublic
        ? `Bet: ${config.betIdea}`
        : `This is a bet between @${config.counterparty} and the creator!`
    const subtitle = `${config.amount} ${config.currency} - Arbitrated by @${config.arbitrator}`

    return (
        <BasicView
            title={title}
            subtitle={subtitle}
            bottomMessage={storage.betAccepted ? 'Bet accepted!' : 'Waiting for counterparty...'}
            background={config.background}
            primaryColor={config.primaryColor}
            secondaryColor={config.secondaryColor}
            fontFamily={config.fontFamily}
        />
    )
}
