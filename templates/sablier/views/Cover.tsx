import { dimensionsForRatio } from '@/lib/constants'
import { chainIdToMetadata } from '../utils/constants'

export default function CoverView(streamData: any) {
    const {
        alias,
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

    console.log(asset.address)

    const MAX_VALUE_OUTER = 565.48
    const MAX_VALUE_INNER = 439.82

    const percentageOuterCircle = (percentage: number) =>
        MAX_VALUE_OUTER - (MAX_VALUE_OUTER * percentage) / 100

    const percentageInnerCircle = (percentage: number) =>
        MAX_VALUE_INNER - (MAX_VALUE_INNER * percentage) / 100
		
	const percentageWithdrawn = withdrawnAmount == 0 ? 0 : (depositAmount * 100) / withdrawnAmount

    console.log('depositAmount', depositAmount)
    console.log('withdrawnAmount', withdrawnAmount)
    console.log('percentageWithdrawn', percentageWithdrawn)

    return (
        <div
            style={{
                display: 'flex',
                flexFlow: 'column',
                justifyContent: 'space-between',
                height: dimensionsForRatio['1.91/1'].height + 'px',
                width: dimensionsForRatio['1.91/1'].width + 'px',
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
                Stream #{alias.toUpperCase()}
            </span>
            <div
                style={{
                    width: '80%',
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    // alignItems: 'flex-start',
                    alignSelf: 'center',
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
                <svg width="120" height="120" viewBox="0 0 200 200">
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
                        stroke-dashoffset={percentageInnerCircle(percentageWithdrawn)}
                        stroke-linecap="round"
                        transform="rotate(-90 100 100)"
                    />
                </svg>

                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        alignItems: 'stretch',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            width: '100%',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                            }}
                        >
                            {funder.slice(0, 5) + '...' + funder.slice(-3)}
                        </div>
                        <span style={{ fontSize: '24px', paddingLeft: '5px', paddingRight: '5px' }}>
                            →
                        </span>
                        <div
                            style={{
                                display: 'flex',
                            }}
                        >
                            {recipient.slice(0, 5) + '...' + recipient.slice(-3)}
                        </div>
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            gap: '5px',
                        }}
                    >
                        <img
                            src={asset.logo}
                            style={{ borderRadius: '50%' }}
                            alt=""
                            width={20}
                            height={20}
                        />
                        {depositAmount / 10 ** asset.decimals} {asset.symbol} (total)
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            gap: '5px',
                        }}
                    >
                        <img
                            src={asset.logo}
                            style={{ borderRadius: '50%' }}
                            alt=""
                            width={20}
                            height={20}
                        />
                        {withdrawnAmount
                            ? (withdrawnAmount / 10 ** asset.decimals).toFixed(2)
                            : '0'}{' '}
                        {asset.symbol} (withdrawn)
                    </div>

                    {/* <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <img
                            src={asset.logo}
                            style={{ borderRadius: '50%' }}
                            alt=""
                            width={20}
                            height={20}
                        />

                        <div
                            style={{
                                display: 'flex',
                            }}
                        >
                            {asset.symbol}
                        </div>
                    </div> */}
                </div>
            </div>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    width: '100%',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '5px',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '14px',
                        padding: '5px',
                    }}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        aria-hidden="true"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605"
                        />
                    </svg>
                    <div style={{ display: 'flex', fontSize: '14px' }}>{shape.toUpperCase()}</div>
                </div>

                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '5px',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '14px',
                        padding: '5px',
                    }}
                >
                    <img src={chainIdToMetadata[chainId].icon} alt="" width={20} height={20} />

                    <div style={{ display: 'flex' }}>
                        {chainIdToMetadata[chainId].name.toUpperCase()}{' '}
                    </div>
                </div>
            </div>
        </div>
    )
}
