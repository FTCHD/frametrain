import type { Config } from '..'

export default function EstimateView({
    token0,
    token1,
    network,
}: Pick<NonNullable<Config['pool']>, 'token0' | 'token1' | 'network'>) {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 64,
                gap: 48,
                backgroundColor: '#FCFCFD',
                color: '#22262A',
                lineHeight: 1.2,
                fontSize: 50,
                width: '100%',
                height: '100%',
                fontFamily: 'inter',
            }}
        >
            <span
                style={{
                    fontSize: 50,
                    fontFamily: 'Nunito',
                    textAlign: 'center',
                    fontWeight: 700,
                    lineHeight: 1,
                }}
            >
                Buy {token1.symbol} using {token0.symbol} on {network.name}
            </span>
        </div>
    )
}
