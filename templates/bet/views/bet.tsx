import BasicView from '@/sdk/views/BasicView'
import type { Config, Storage } from '..'

export default function BetView(
    config: Config,
    storage: Storage,
    userRole: 'creator' | 'counterparty' | 'arbitrator' | 'other'
) {
    const title = getTitle(config)
    const subtitle = getSubtitle(config, storage)
    const bottomMessage = getBottomMessage(config, storage, userRole)

    return (
        <BasicView
            title={title}
            subtitle={subtitle}
            bottomMessage={bottomMessage}
            background={config.background}
            primaryColor={config.primaryColor}
            secondaryColor={config.secondaryColor}
            fontFamily={config.fontFamily}
        />
    )
}

function getTitle(config: Config): string {
    return config.isPublic ? `Bet: ${config.betIdea}` : 'Private Bet'
}

function getSubtitle(config: Config, storage: Storage): string {
    let subtitle = `${config.amount} ${config.currency} - Arbitrated by @${config.arbitrator}`
    if (storage.winner) {
        subtitle += ` - Winner: ${storage.winner === 'user' ? 'Creator' : 'Counterparty'}`
    }
    return subtitle
}

function getBottomMessage(
    config: Config,
    storage: Storage,
    userRole: 'creator' | 'counterparty' | 'arbitrator' | 'other'
): string {
    switch (userRole) {
        case 'creator':
            return getCreatorMessage(config, storage)
        case 'counterparty':
            return getCounterpartyMessage(config, storage)
        case 'arbitrator':
            return getArbitratorMessage(storage)
        default:
            return 'You are not part of this bet'
    }
}

function getCreatorMessage(config: Config, storage: Storage): string {
    if (storage.winner) {
        return storage.winner === 'user'
            ? 'You won! Waiting for payment confirmation.'
            : `You need to pay ${config.amount} ${config.currency} to the winner.`
    }
    return 'Waiting for counterparty to accept or arbitrator to decide'
}

function getCounterpartyMessage(config: Config, storage: Storage): string {
    if (storage.winner) {
        return storage.winner === 'counterparty'
            ? `You won! Waiting for payment of ${config.amount} ${config.currency}.`
            : `You lost. The creator will receive ${config.amount} ${config.currency}.`
    }
    return storage.betAccepted ? 'You accepted the bet' : 'Do you accept this bet?'
}

function getArbitratorMessage(storage: Storage): string {
    return storage.winner ? `Winner: ${storage.winner}` : 'You need to decide the winner'
}
