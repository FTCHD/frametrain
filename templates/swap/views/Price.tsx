import type { Config } from '..'

export default function PriceView({ token0, token1, network }: NonNullable<Config['pool']>) {
    // const token1Symbol = token1.symbol.replace(/(USDT|USDC|DAI)/, '$')
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
                Swap ${token0.symbol} for ${token1.symbol} on {network.name}
            </span>
        </div>
    )
}
