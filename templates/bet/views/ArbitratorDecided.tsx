import type { Config } from '..'

export default function ArbitratorDecidedView(config: Config, opponentAccepted: boolean) {
    const { background, textColor } = config
    const backgroundProp: Record<string, string> = {}

    if (background) {
        if (background.startsWith('#')) {
            backgroundProp['backgroundColor'] = background
        } else {
            backgroundProp['backgroundImage'] = background
        }
    } else {
        backgroundProp['backgroundImage'] = 'linear-gradient(to right, #0f0c29, #0b6bcb, #0f0c29)'
    }

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                height: '100%',
                padding: '30px',
                ...backgroundProp,
            }}
        >
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '30px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.22)',
                    color: textColor || 'white',
                    fontSize: '60px',
                    textAlign: 'center',
                    fontWeight: '500',
                    lineHeight: '1.2',
                    textWrap: 'balance',
                }}
            >
                The winner is @{config.winner}
            </div>
        </div>
    )
}
