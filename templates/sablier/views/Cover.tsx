import { chainIdToMetadata } from '../utils/constants'

export default function CoverView(streamData: any) {
    const {
        chainId,
        funder,
        recipient,
        depositAmount,
        intactAmount,
        withdrawnAmount,
        startTime,
        endTime,
        timestamp,
        asset,
        category,
        shape,
    } = streamData

    const chainName = chainIdToMetadata[chainId].name

    const MAX_VALUE_OUTER = 565.48
    const MAX_VALUE_INNER = 439.82

    const percentageOuterCircle = (percentage: number) =>
        MAX_VALUE_OUTER - (MAX_VALUE_OUTER * percentage) / 100

    const percentageInnerCircle = (percentage: number) =>
        MAX_VALUE_INNER - (MAX_VALUE_INNER * percentage) / 100

    return (
        <div
            style={{
                display: 'flex',
                flexFlow: 'column',
                justifyContent: 'space-between',
                height: '302px',
                width: '540px',
                backgroundImage: 'linear-gradient(to right, #e26200, #d88502, #e26200)',
                color: '#ffffff',
                padding: '20px',
                gap: '10px',
            }}
        >
            <span
                style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                }}
            >
                TOKEN
            </span>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    padding: '10px',
                    paddingTop: '12px',
                    paddingBottom: '12px',
                    borderRadius: '4px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: '#fff',
                    fontSize: '14px',
                    gap: '10px',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                    }}
                >
                    <svg width="200" height="200" viewBox="0 0 200 200">
                        <defs>
                            <linearGradient id="outerGradient" gradientTransform="rotate(90)">
                                <stop offset="0%" stop-color="#0099ff" />
                                <stop offset="100%" stop-color="#66ccff" />
                            </linearGradient>
                            <linearGradient id="innerGradient" gradientTransform="rotate(90)">
                                <stop offset="0%" stop-color="#00cc00" />
                                <stop offset="100%" stop-color="#66ff66" />
                            </linearGradient>
                        </defs>

                        <circle cx="100" cy="100" r="95" fill="gray" />

                        <circle
                            cx="100"
                            cy="100"
                            r="90"
                            fill="none"
                            stroke="#e6e6e670" // 70% opacity
                            stroke-width="10"
                        />
                        <circle
                            cx="100"
                            cy="100"
                            r="90"
                            fill="none"
                            stroke="url(#outerGradient)"
                            stroke-width="10"
                            stroke-dasharray={MAX_VALUE_OUTER} // max value (filled)
                            stroke-dashoffset={percentageOuterCircle(60)}
                            stroke-linecap="round"
                            transform="rotate(-90 100 100)"
                        />

                        <circle
                            cx="100"
                            cy="100"
                            r="70"
                            fill="none"
                            stroke="#e6e6e670" // 70% opacity
                            stroke-width="10"
                        />
                        <circle
                            cx="100"
                            cy="100"
                            r="70"
                            fill="none"
                            stroke="url(#innerGradient)"
                            stroke-width="10"
                            stroke-dasharray={MAX_VALUE_INNER} // max value (filled)
                            stroke-dashoffset={percentageInnerCircle(10)}
                            stroke-linecap="round"
                            transform="rotate(-90 100 100)"
                        />
                    </svg>
                </div>
                <div
                    style={{
                        display: 'flex',
                    }}
                >
                    {funder}
                </div>
                <div
                    style={{
                        display: 'flex',
                    }}
                >
                    {recipient}
                </div>
                <div
                    style={{
                        display: 'flex',
                    }}
                >
                    {depositAmount / 10 ** asset.decimals}
                </div>
                <div
                    style={{
                        display: 'flex',
                    }}
                >
                    {intactAmount
                        ? (intactAmount / 10 ** asset.decimals).toFixed(2)
                        : 'Nothing left'}
                </div>
                <div
                    style={{
                        display: 'flex',
                    }}
                >
                    {withdrawnAmount ? (withdrawnAmount / 10 ** asset.decimals).toFixed(2) : '0'}
                </div>
                <div
                    style={{
                        display: 'flex',
                    }}
                >
                    {asset.symbol}
                </div>

                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        width: '100%',
                    }}
                >
                    <div style={{ display: 'flex' }}>{shape} </div>

                    <div style={{ display: 'flex' }}>{chainIdToMetadata[chainId].name} </div>
                </div>
            </div>
        </div>
    )
}
