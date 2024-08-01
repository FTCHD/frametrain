import type { Config } from '..'

export default function CoverView(config: Config) {
    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                backgroundColor: 'black',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                fontFamily: 'Roboto',
                fontSize: '50px',
                color: '#ffffff',
            }}
        >
            {config.etherscan
                ? 'Press "START" to begin your journey'
                : 'Enter a contract address url to get started'}
        </div>
    )
}
