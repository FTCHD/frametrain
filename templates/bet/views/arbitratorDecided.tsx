import BasicView from '@/sdk/views/BasicView'
import type { Config, Storage } from '..'

export default function ArbitratorDecidedView(config: Config, storage: Storage) {
    const title = 'Arbitrator Has Decided'
    const subtitle = `${config.amount} ${config.currency} - Winner: ${
        storage.winner === 'user' ? 'Creator' : 'Counterparty'
    }`
    const bottomMessage = 'The bet has been resolved'

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
