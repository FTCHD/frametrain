import BasicView from '@/sdk/views/BasicView'
import type { Config } from '..'

export default function CounterpartyAcceptedView(config: Config) {
    const title = 'Bet Accepted!'
    const subtitle = `${config.amount} ${config.currency} - Arbitrated by @${config.arbitrator}`
    const bottomMessage = `Waiting for the deadline or arbitrator's decision`

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
