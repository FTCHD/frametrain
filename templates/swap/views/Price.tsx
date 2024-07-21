import type { Config } from '..'
import { formatSymbol, generateTokenLogoUrl } from '../utils/shared'

type PriceViewProps = Pick<NonNullable<Config['pool']>, 'token0' | 'token1' | 'network'> & {
    amount: number
    estimates: {
        price: number
        rate: string
    }
}

export default function PriceView({ token0, token1, network, estimates, amount }: PriceViewProps) {
    const value = formatSymbol(Number(amount).toFixed(2), token1.symbol)

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
                    fontFamily: 'nunito',
                    textAlign: 'center',
                    lineHeight: 1,
                }}
            >
                Fx Rate: 1 {token0.symbol} ={formatSymbol(estimates.rate, token1.symbol)}
            </span>
            <div style={{ display: 'flex', gap: 36 }}>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid rgba(15, 36, 56, 0.1)',
                        backgroundColor: '#FFFFFF',
                        borderRadius: 32,
                        gap: 16,
                        padding: '32px 48px',
                    }}
                >
                    <img
                        alt={`${token0.symbol} logo`}
                        src={generateTokenLogoUrl(network.id, token0.address)}
                        width={54}
                        height={54}
                        style={{ borderRadius: 9999 }}
                    />
                    <span style={{ color: '#5E6773', fontSize: 50 }}>
                        {Number(estimates.price).toFixed(7)} {token0.symbol}
                    </span>
                </div>
                <span style={{ color: '#5E6773', top: '50%' }}>{'==>'}</span>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid rgba(15, 36, 56, 0.1)',
                        backgroundColor: '#FFFFFF',
                        borderRadius: 32,
                        gap: 16,
                        padding: '32px 48px',
                    }}
                >
                    <img
                        alt={`${token1.symbol} logo`}
                        src={generateTokenLogoUrl(network.id, token1.address)}
                        width={54}
                        height={54}
                        style={{ borderRadius: 9999 }}
                    />
                    <span style={{ color: '#5E6773' }}>{value}</span>
                </div>
            </div>
        </div>
    )
}
