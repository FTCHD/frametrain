
export default function TokenView(streamData: any) {
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
        segments, // relevant if category is LockupDynamic
    } = streamData

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
                    fontSize: '16px',
                    gap: '20px',
                }}
            >
                <div style={tokenRowStyle}>
                    <span>NAME</span>
                    <span style={{ fontWeight: 'bold' }}>{asset.name}</span>
                </div>
                <div style={tokenRowStyle}>
                    <span>SYMBOL</span>
                    <span style={{ fontWeight: 'bold' }}>{asset.symbol}</span>
                </div>
                <div style={tokenRowStyle}>
                    <span>DECIMALS</span>
                    <span style={{ fontWeight: 'bold' }}>{asset.decimals}</span>
                </div>
                <div style={tokenRowStyle}>
                    <span>ADDRESS</span>
                    <span style={{ fontWeight: 'bold' }}>{asset.address}</span>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <span style={{ fontSize: '8px', fontStyle: 'italic', color: '#0052ff' }}>
                    Powered by Sablier
                </span>
            </div>
        </div>
    )
}

const tokenRowStyle = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
} as const