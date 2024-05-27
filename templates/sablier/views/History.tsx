import * as dayjs from 'dayjs'
import { abbreviateNumber } from 'js-abbreviation-number'
import { chainIdToMetadata } from '../utils/constants'

export default function HistoryView(streamData: any, streamHistory: any) {
    const { asset, chainId } = streamData

    const chainColor = chainIdToMetadata[chainId].color

    const MAX_EVENTS = 6

    const tooBig = streamHistory.length > MAX_EVENTS

    const events = tooBig ? streamHistory.slice(0, MAX_EVENTS) : streamHistory

    function getAmount(historyItem: any) {
        const amount = historyItem.amountA
            ? historyItem.amountA / 10 ** asset.decimals
            : historyItem.amountB
              ? historyItem.amountB / 10 ** asset.decimals
              : 0

        return amount
        // return amount.toLocaleString('en-US', {
        //     maximumFractionDigits: amount > 1_000 ? 0 : amount > 1 ? 2 : 8,
        // })
    }

    function getDisplayedDecimals(amount: number) {
        return amount > 1_000 ? 0 : amount > 1 ? 2 : 6
    }

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
            <span
                style={{
                    fontFamily: 'Catamaran',
                    fontSize: '40px',
                    fontWeight: 900,
                    color: 'orange',
                }}
            >
                Latest Events
            </span>
            <div
                style={{
                    width: '100%',
                    display: 'flex',
                    flexGrow: '1',
                    flexDirection: 'column',
                    padding: '30px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.15)',
                    gap: '15px',
                    border: '2px solid #392a3b',
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <span style={{ ...rowStyleHeader, width: '17%' }}>Event</span>
                    <span style={{ ...rowStyleHeader, width: '25%' }}>Timestamp</span>
                    <span style={{ ...rowStyleHeader, width: '21%' }}>Initator</span>
                    <span style={{ ...rowStyleHeader, width: '21%' }}>Receiver</span>
                    <span style={{ ...rowStyleHeader, width: '16%' }}>Amount</span>
                </div>

                {events.map((historyItem: any) => {
                    const amount = getAmount(historyItem)
                    const multiplier = 10 ** getDisplayedDecimals(amount)
                    const finalAmount = Math.round(amount * multiplier) / multiplier

                    return (
                        // show category, timestamp, addressA, addressB, amountA, amountB
                        <div key={historyItem.id} style={{ display: 'flex', flexDirection: 'row' }}>
                            <span style={{ ...rowStyle, width: '17%' }}>
                                {historyItem.category.toUpperCase()}
                            </span>
                            <span style={{ ...rowStyle, width: '25%' }}>
                                {dayjs.unix(historyItem.timestamp).format("MMM DD 'YY (HH:MM)")}
                            </span>
                            <span style={{ ...rowStyle, width: '21%' }}>
                                {historyItem.addressA.slice(0, 6)}...
                                {historyItem.addressA.slice(-4)}
                            </span>
                            <span style={{ ...rowStyle, width: '21%' }}>
                                {historyItem.addressB.slice(0, 6)}...
                                {historyItem.addressB.slice(-4)}
                            </span>
                            <span style={{ ...rowStyle, width: '16%' }}>
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        gap: '10px',
                                    }}
                                >
                                    <img
                                        src={asset.logo}
                                        style={{ borderRadius: '50%' }}
                                        alt=""
                                        width={40}
                                        height={40}
                                    />
                                    <span>{abbreviateNumber(finalAmount, 1)}</span>
                                </div>
                            </span>
                        </div>
                    )
                })}

                {tooBig && (
                    <span style={{ fontSize: '25px', color: 'lightgray', fontWeight: 600 }}>
                        ...and {streamHistory.length - MAX_EVENTS} more
                    </span>
                )}
            </div>
        </div>
    )
}

const rowStyle = { fontSize: '30px', fontWeight: 600 }

const rowStyleHeader = { fontSize: '35px', fontWeight: 800 }
