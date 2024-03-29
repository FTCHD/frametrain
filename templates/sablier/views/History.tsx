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

    console.log(streamHistory)

    const MAX_EVENTS = 6

    const tooBig = streamHistory.length > MAX_EVENTS

    const events = tooBig ? streamHistory.slice(0, MAX_EVENTS) : streamHistory

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
                LATEST
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

                    gap: '10px',
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <span style={{ ...rowStyleHeader, width: '20%' }}>Event</span>
                    <span style={{ ...rowStyleHeader, width: '30%' }}>Timestamp</span>
                    <span style={{ ...rowStyleHeader, width: '15%' }}>Initator</span>
                    <span style={{ ...rowStyleHeader, width: '15%' }}>Receiver</span>
                    <span style={{ ...rowStyleHeader, width: '20%' }}>Amount</span>
                </div>

                {events.map((historyItem: any) => (
                    // show category, timestamp, addressA, addressB, amountA, amountB
                    <div key={historyItem.id} style={{ display: 'flex', flexDirection: 'row' }}>
                        <span style={{ ...rowStyle, width: '20%' }}>
                            {' '}
                            {historyItem.category.toUpperCase()}
                        </span>
                        <span style={{ ...rowStyle, width: '30%' }}>
                            {dayjs.unix(historyItem.timestamp).format("MMM DD 'YY @ h mm A")}
                        </span>
                        <span style={{ ...rowStyle, width: '15%' }}>
                            {historyItem.addressA.slice(0, 5)}...{historyItem.addressA.slice(-3)}
                        </span>
                        <span style={{ ...rowStyle, width: '15%' }}>
                            {historyItem.addressB.slice(0, 5)}...{historyItem.addressB.slice(-3)}
                        </span>
                        <span style={{ ...rowStyle, width: '20%' }}>
                            {historyItem.amountA
                                ? (historyItem.amountA / 10 ** asset.decimals).toFixed(2)
                                : historyItem.amountB
                                  ? (historyItem.amountB / 10 ** asset.decimals).toFixed(2)
                                  : 0}{' '}
                            {asset.symbol}
                        </span>
                    </div>
                ))}

                {tooBig && (
                    <span style={{ fontSize: '12px', color: 'lightgray' }}>
                        ...and {streamHistory.length - MAX_EVENTS} more
                    </span>
                )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <span style={{ fontSize: '8px', fontStyle: 'italic', color: '#0052ff' }}>
                    Powered by Sablier
                </span>
            </div>
        </div>
    )
}

const rowStyle = { fontSize: '10px' }

const rowStyleHeader = { fontsize: '14px', fontWeight: 'bold' }

