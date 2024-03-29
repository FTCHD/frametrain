import { dimensionsForRatio } from '@/lib/constants'

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
                    fontWeight: '900',
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
                    fontSize: '12px',
                    gap: '20px',
                }}
            >
                <div style={tokenRowStyle}>
                    <span>NAME</span>
                    <span style={{ fontWeight: '800', fontSize: '14px' }}>{asset.name}</span>
                </div>
                <div style={tokenRowStyle}>
                    <span>SYMBOL</span>

                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
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

                        <span style={{ fontWeight: '800', fontSize: '14px' }}>{asset.symbol}</span>
                    </div>
                </div>
                <div style={tokenRowStyle}>
                    <span>DECIMALS</span>
                    <span style={{ fontWeight: '800', fontSize: '14px' }}>{asset.decimals}</span>
                </div>
                <div style={tokenRowStyle}>
                    <span>ADDRESS</span>
                    <span style={{ fontWeight: '800', fontSize: '14px' }}>{asset.address}</span>
                </div>
            </div>

            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                }}
            >
                <span
                    style={{
                        fontSize: '7px',
                        fontStyle: 'italic',
                        fontWeight: '500',
                        color: 'white',
                        backgroundColor: '#0052ff',
                        padding: '5px',
                        paddingLeft: '10px',
                        paddingRight: '10px',
                        borderRadius: '14px',
                    }}
                >
                    Powered by
                    <img
                        src="https://docs.sablier.com/img/icon.svg"
                        style={{ width: '8px', height: '8px', marginLeft: '4px' }}
                        alt=""
                    />
                    <span style={{ fontWeight: 'bold', fontStyle: 'normal' }}>Sablier</span>
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
    fontWeight: '500',
} as const