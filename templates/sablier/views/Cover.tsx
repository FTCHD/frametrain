
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

    const MAX_VALUE_OUTER = 565.48
    const MAX_VALUE_INNER = 439.82

    const percentageOuterCircle = (percentage: number) =>
        MAX_VALUE_OUTER - (MAX_VALUE_OUTER * percentage) / 100

    const percentageInnerCircle = (percentage: number) =>
        MAX_VALUE_INNER - (MAX_VALUE_INNER * percentage) / 100
		
	const percentageWithdrawn = withdrawnAmount == 0 ? 0 : (depositAmount * 100) / withdrawnAmount
	
	const formattedWithdrawAmount = withdrawnAmount / 10 ** asset.decimals
    const formattedDepositAmount = depositAmount / 10 ** asset.decimals

    console.log('depositAmount', depositAmount)
    console.log('withdrawnAmount', withdrawnAmount)
    console.log('percentageWithdrawn', percentageWithdrawn)

    return (
        <div
            style={{
                display: 'flex',
                flexFlow: 'column',
                height: '100%',
                width: '100%',
                backgroundImage: 'linear-gradient(to right, #e26200, #d88502, #e26200)',
                color: '#ffffff',
                padding: '30px',
                gap: '30px',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    flexBasis: '10%',
                    width: '100%',
                    fontSize: '48px',
                    fontWeight: 'bold',
                }}
            >
                Stream #{alias.toUpperCase()}
            </div>
            <div
                style={{
                    width: '100%',
                    display: 'flex',
                    flexGrow: '1',
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    // alignItems: 'flex-start',
                    gap: '10px',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '14px',
                        // borderRadius: '10px',
                        // background: 'rgba(0, 0, 0, 0.25)',
                    }}
                >
                    <svg width="420" height="420" viewBox="0 0 200 200">
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
                </div>

                <div
                    style={{
                        display: 'flex',
                        flexGrow: '1',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        padding: '14px',
                        borderRadius: '10px',
                        background: 'rgba(256, 256, 256, 0.2)',
                        backdropFilter: 'blur(15px)',
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
                                fontSize: '36px',
                            }}
                        >
                            FUNDER
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                fontSize: '36px',
                                fontWeight: 'bold',
                            }}
                        >
                            {funder.slice(0, 8) + '...' + funder.slice(-3)}
                        </div>
                    </div>
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
                                fontSize: '36px',
                            }}
                        >
                            RECIPIENT
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                fontSize: '36px',
                                fontWeight: 'bold',
                            }}
                        >
                            {recipient.slice(0, 8) + '...' + recipient.slice(-3)}
                        </div>
                    </div>

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
                                fontSize: '36px',
                            }}
                        >
                            TOTAL
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: '5px',
                                fontSize: '24px',
                                fontWeight: 'bold',
                            }}
                        >
                            <img
                                src={asset.logo}
                                style={{ borderRadius: '50%' }}
                                alt=""
                                width={40}
                                height={40}
                            />
                            {formattedDepositAmount.toLocaleString('en-US', {
                                maximumFractionDigits:
                                    formattedDepositAmount > 1_000
                                        ? 0
                                        : formattedDepositAmount > 1
                                          ? 2
                                          : 8,
                            })}{' '}
                            {asset.symbol}
                        </div>
                    </div>

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
                                fontSize: '36px',
                            }}
                        >
                            WITHDRAWN
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: '5px',
                                fontSize: '24px',
                                fontWeight: 'bold',
                            }}
                        >
                            <img
                                src={asset.logo}
                                style={{ borderRadius: '50%' }}
                                alt=""
                                width={40}
                                height={40}
                            />
                            {formattedWithdrawAmount
                                ? formattedWithdrawAmount.toLocaleString('en-US', {
                                      maximumFractionDigits:
                                          formattedWithdrawAmount > 1_000
                                              ? 0
                                              : formattedWithdrawAmount > 1
                                                  ? 2
                                                  : 8,
                                  })
                                : '0'}{' '}
                            {asset.symbol}
                        </div>
                    </div>

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
                                fontSize: '36px',
                            }}
                        >
                            STREAM SHAPE
                        </div>

                        <div style={{ display: 'flex', fontSize: '28px', fontWeight: 'bold' }}>
                            {shape.toUpperCase()}
                        </div>
                    </div>

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
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: '5px',
                            }}
                        >
                            {/* <Signal color="#ffffff" width={100} height={100} /> */}
                            <div
                                style={{
                                    display: 'flex',
                                    fontSize: '36px',
                                }}
                            >
                                NETWORK
                            </div>
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: '5px',
                            }}
                        >
                            <img
                                src={chainIdToMetadata[chainId].icon}
                                alt=""
                                width={40}
                                height={40}
                            />

                            <div style={{ display: 'flex', fontSize: '28px', fontWeight: 'bold' }}>
                                {chainName.toUpperCase()}
                            </div>
                        </div>
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
        </div>
    )
}
