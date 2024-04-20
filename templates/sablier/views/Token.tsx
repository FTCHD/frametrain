import { chainIdToMetadata } from '../utils/constants'

export default function TokenView(streamData: any) {
    const {
        chainId,
        funder,
        recipient,
        depositAmount,
        intactAmount,        withdrawnAmount,
        startTime,
        endTime,
        timestamp,
        asset,
        category,
        segments, // relevant if category is LockupDynamic
    } = streamData

    const chainName = chainIdToMetadata[chainId].name

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
                Token Details
            </span>
            <div
                style={{
                    width: '100%',
                    display: 'flex',
                    flexGrow: '1',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '14px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.25)',
                    gap: '10px',
                }}
            >
                <div style={tokenRowStyle}>
                    <span>NAME</span>
                    <span style={{ fontWeight: '800', fontSize: '42px' }}>{asset.name}</span>
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
                            width={40}
                            height={40}
                        />

                        <span style={{ fontWeight: '800', fontSize: '42px' }}>{asset.symbol}</span>
                    </div>
                </div>
                <div style={tokenRowStyle}>
                    <span>DECIMALS</span>
                    <span style={{ fontWeight: '800', fontSize: '42px' }}>{asset.decimals}</span>
                </div>
                <div style={tokenRowStyle}>
                    <span>ADDRESS</span>
                    <div
                        style={{
                            display: 'flex',
                            fontWeight: '800',
                            fontSize: '32px',
                        }}
                    >
                        {asset.address}
                    </div>
                </div>
                <div style={tokenRowStyle}>
                    <span>NETWORK</span>

                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: '5px',
                        }}
                    >
                        <img src={chainIdToMetadata[chainId].icon} alt="" width={40} height={40} />

                        <span style={{ fontWeight: '800', fontSize: '42px' }}>
                            {chainName.toUpperCase()}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )

  
}

const tokenRowStyle = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    fontWeight: '500',
    fontSize: '46px',
} as const