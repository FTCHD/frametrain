import type { Config } from '..'

export default function ConfirmationView({ amount, config }: { amount: string; config: Config }) {
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                fontSize: 44,
                flexDirection: 'column',
                flexGrow: 1,
                padding: 32,
                textAlign: 'left',
                alignItems: 'center',
                height: '100%',
                backgroundColor: 'rgb(255,255,255)',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    alignItems: 'center',
                    flexGrow: 1,
                    padding: 32,
                    textAlign: 'center',
                    color: 'rgb(131,131,131)',
                    fontWeight: 600,
                    fontSize: 50,
                }}
            >
                You are about to donate {amount}
            </div>
            <div
                style={{
                    height: '10',
                    width: `${(2 / 3) * 100}%`,
                    top: 0,
                    position: 'absolute',
                    left: 0,
                    backgroundColor: config?.barColor || 'yellow',
                }}
            />
        </div>
    )
}
