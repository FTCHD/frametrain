import * as dayjs from 'dayjs'

export default function HistoryView(streamData: any, streamHistory: any) {
    //const {
    //     chainId,
    //     funder,
    //     recipient,
    //     depositAmount,
    //     intactAmount,
    //     withdrawnAmount,
    //     startTime,
    //     endTime,
    //     timestamp,
    //     asset,
    //     category,
    //     segments, // relevant if category is LockupDynamic
    // } = streamData

    const { asset } = streamData

    const MAX_EVENTS = 6

    const tooBig = streamHistory.length > MAX_EVENTS

    const events = tooBig ? streamHistory.slice(0, MAX_EVENTS) : streamHistory

    function getAmount(historyItem: any) {
        const amount = historyItem.amountA
            ? historyItem.amountA / 10 ** asset.decimals
            : historyItem.amountB
              ? historyItem.amountB / 10 ** asset.decimals
              : 0

        return amount.toLocaleString('en-US', {
            maximumFractionDigits: amount > 1_000 ? 0 : amount > 1 ? 2 : 8,
        })
    }

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
            <span
                style={{
                    fontSize: '48px',
                    fontWeight: 'bold',
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
                    padding: '14px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.25)',
                    gap: '10px',
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <span style={{ ...rowStyleHeader, width: '15%' }}>Event</span>
                    <span style={{ ...rowStyleHeader, width: '24%' }}>Timestamp</span>
                    <span style={{ ...rowStyleHeader, width: '18%' }}>Initator</span>
                    <span style={{ ...rowStyleHeader, width: '18%' }}>Receiver</span>
                    <span style={{ ...rowStyleHeader, width: '25%' }}>Amount</span>
                </div>

                {events.map((historyItem: any) => (
                    // show category, timestamp, addressA, addressB, amountA, amountB
                    <div key={historyItem.id} style={{ display: 'flex', flexDirection: 'row' }}>
                        <span style={{ ...rowStyle, width: '15%' }}>
                            {' '}
                            {historyItem.category.toUpperCase()}
                        </span>
                        <span style={{ ...rowStyle, width: '24%' }}>
                            {dayjs.unix(historyItem.timestamp).format("MMM DD 'YY (HH:MM)")}
                        </span>
                        <span style={{ ...rowStyle, width: '18%' }}>
                            {historyItem.addressA.slice(0, 6)}...{historyItem.addressA.slice(-4)}
                        </span>
                        <span style={{ ...rowStyle, width: '18%' }}>
                            {historyItem.addressB.slice(0, 6)}...{historyItem.addressB.slice(-4)}
                        </span>
                        <span style={{ ...rowStyle, width: '25%' }}>
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
                                <span>{getAmount(historyItem)}</span>
                            </div>
                        </span>
                    </div>
                ))}

                {tooBig && (
                    <span style={{ fontSize: '12px', color: 'lightgray' }}>
                        ...and {streamHistory.length - MAX_EVENTS} more
                    </span>
                )}
            </div>
        </div>
    )
}

const rowStyle = { fontSize: '30px' }

const rowStyleHeader = { fontSize: '36px', fontWeight: 'bold' }
