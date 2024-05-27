
import BigNumber from 'bignumber.js'
import hourglass from '../hourglass.png'
import { getStreamDuration } from '../utils/actions'
import { chainIdToMetadata } from '../utils/constants'

export default function CoverView(streamData: any) {
    const {
        alias,
        chainId,
        funder,
        recipient,
        depositAmount,
        withdrawnAmount,
        startTime,
        endTime,
        asset,
        shape,
        canceled,
    } = streamData

    const MAX_VALUE_OUTER = 565.48
    const MAX_VALUE_INNER = 500

    const percentageOuterCircle = (percentage: number) =>
        MAX_VALUE_OUTER - (MAX_VALUE_OUTER * percentage) / 100

    const percentageInnerCircle = (percentage: number) =>
        MAX_VALUE_INNER - (MAX_VALUE_INNER * percentage) / 100

    const percentageWithdrawn = new BigNumber(withdrawnAmount).isEqualTo(0)
        ? 0
        : (withdrawnAmount / depositAmount) * 100

    const formattedWithdrawAmount = withdrawnAmount / 10 ** asset.decimals
    const formattedDepositAmount = depositAmount / 10 ** asset.decimals

    const streamStatus = canceled
        ? 'CANCELED'
        : percentageWithdrawn === 100
          ? 'WITHDRAWN'
          : new Date().getTime() < new Date(startTime).getTime()
              ? 'PENDING'
              : 'ACTIVE'

    const streamDuration = getStreamDuration(streamData)

    const chainColor = chainIdToMetadata[chainId].color

    return (
        <div
            style={{
                display: 'flex',
                flexFlow: 'column',
                height: '100%',
                width: '100%',
                backgroundImage: `linear-gradient(to top, #2a2432 55%, ${chainColor})`,
                // backgroundImage: 'url(' + process.env.NEXT_PUBLIC_HOST + bg.src + ')',
                // backgroundSize: '100% 100%',
                // backgroundRepeat: 'no-repeat',
                color: '#ffffff',
                padding: '30px',
                gap: '30px',
                fontFamily: 'Urbanist',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    // background: 'red',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        flexBasis: '50%',
                        width: '100%',
                        fontFamily: 'Catamaran',
                        fontSize: '50px',
                        fontWeight: 900,
                        gap: '10px',
                        color: 'orange',
                    }}
                >
                    <img
                        src={process.env.NEXT_PUBLIC_HOST + hourglass.src}
                        width="72px"
                        height="72px"
                        alt="hourglass"
                    />
                    <span>#{alias.toUpperCase()}</span>
                </div>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                        width: '100%',
                        fontFamily: 'Urbanist',
                        fontSize: '42px',
                        fontWeight: 700,
                        fontStyle: 'italic',
                        color: 'orange',
                    }}
                >
                    {shape}
                </div>
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
                        paddingRight: '15px',
                        // borderRadius: '10px',
                        // background: 'rgba(0, 0, 0, 0.25)',
                    }}
                >
                    <svg width="440" height="400" viewBox="0 0 400 400">
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

                        <circle
                            cx="200"
                            cy="200"
                            r="200"
                            fill="#2e2e3070"
                            style={{ backdropFilter: 'blur(10px)' }}
                        />

                        {/* <circle
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
                        /> */}

                        <circle
                            cx="200"
                            cy="200"
                            r="160"
                            fill="none"
                            stroke="#e6e6e670" // 70% opacity
                            stroke-width="80"
                        />
                        <circle
                            cx="200"
                            cy="200"
                            r="160"
                            fill="none"
                            stroke="url(#innerGradient)"
                            stroke-width="80"
                            stroke-dasharray={MAX_VALUE_INNER} // max value (filled)
                            stroke-dashoffset={percentageInnerCircle(percentageWithdrawn)}
                            stroke-linecap="round"
                            transform="rotate(-90 200 200)"
                        />
                    </svg>

                    <div
                        style={{
                            display: 'flex',
                            position: 'absolute',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: '100%',
                            height: '100%',
                            fontSize: '25px',
                            color: '#ffffff',
                            left: 0,
                            top: 0,
                            fontFamily: 'Catamaran',
                            fontWeight: 900,
                            fontStyle: 'italic',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderRadius: '10px',
                                background: 'rgba(256, 256, 256, 0.2)',
                                backdropFilter: 'blur(15px)',
                                padding: '20px',
                            }}
                        >
                            {streamStatus}
                        </div>
                    </div>
                </div>

                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                        height: '100%',
                        gap: '25px',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            width: '60%',
                            flexGrow: '1',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '20px',
                            borderRadius: '10px',
                            background: 'rgba(255, 255, 255, 0.15)',
                            gap: '10px',
                            border: '2px solid #392a3b',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                fontSize: '40px',
                                fontWeight: 900,
                            }}
                        >
                            {recipient.slice(0, 6) + '...' + recipient.slice(-4)}
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                fontSize: '35px',
                                fontWeight: 600,
                            }}
                        >
                            &rarr;
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                fontSize: '40px',
                                fontWeight: 900,
                            }}
                        >
                            {funder.slice(0, 6) + '...' + funder.slice(-4)}
                        </div>
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            width: '60%',
                            flexGrow: '1',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '20px',
                            borderRadius: '10px',
                            background: 'rgba(255, 255, 255, 0.15)',
                            gap: '15px',
                            border: '1px solid #392a3b',
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
                                    fontSize: '30px',
                                    fontWeight: 600,
                                }}
                            >
                                TOTAL
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: '10px',
                                    fontSize: '35px',
                                    fontWeight: 900,
                                }}
                            >
                                <img
                                    src={asset.logo}
                                    style={{ borderRadius: '50%' }}
                                    alt=""
                                    width={36}
                                    height={36}
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
                                    fontSize: '30px',
                                    fontWeight: 600,
                                }}
                            >
                                WITHDRAWN
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: '10px',
                                    fontSize: '35px',
                                    fontWeight: 900,
                                }}
                            >
                                <img
                                    src={asset.logo}
                                    style={{ borderRadius: '50%' }}
                                    alt=""
                                    width={36}
                                    height={36}
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
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            width: '60%',
                            flexGrow: '1',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: '10px',
                            borderRadius: '10px',
                            background: 'rgba(255, 255, 255, 0.15)',
                            gap: '10px',
                            border: '2px solid #392a3b',
                            fontSize: '40px',
                            fontWeight: 700,
                            textTransform: 'capitalize',
                        }}
                    >
                        {streamDuration}
                    </div>
                </div>
            </div>
        </div>
    )
}
