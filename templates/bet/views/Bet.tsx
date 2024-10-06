import type { Config } from '..'

const BetView: React.FC<{ config: Config }> = ({ config }) => {
    const {
        background,
        textColor,
        claim = 'No claim specified',
        owner = { username: 'Unknown owner' },
        opponent = { username: 'Unknown opponent' },
        arbitrator = { username: 'Unknown arbitrator' },
        asset = 'Unknown asset',
        amount = '0'
    } = config;

    const backgroundProp: Record<string, string> = {};

    if (background) {
        if (background.startsWith('#')) {
            backgroundProp['backgroundColor'] = background;
        } else {
            backgroundProp['backgroundImage'] = background;
        }
    } else {
        backgroundProp['backgroundImage'] = 'linear-gradient(to right, #0f0c29, #0b6bcb, #0f0c29)';
    }

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                height: '100%',
                padding: '30px',
                ...backgroundProp,
            }}
        >
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '30px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.22)',
                    color: textColor || 'white',
                    fontSize: '70px',
                    textAlign: 'center',
                    fontWeight: '700',
                    lineHeight: '1.4',
                    textWrap: 'balance',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        fontWeight: '400',
                        fontSize: '30px',
                        marginBottom: '20px',
                        flexDirection: 'row',
                    }}
                >
                    <span>This is a bet between</span>
                    <span
                        style={{
                            fontWeight: '700',
                            textDecoration: 'underline',
                            marginLeft: '5px',
                        }}
                    >
                        @{owner}
                    </span>
                    <span style={{ marginLeft: '5px' }}>and</span>
                    <span
                        style={{
                            fontWeight: '700',
                            textDecoration: 'underline',
                            marginLeft: '5px',
                        }}
                    >
                        @{opponent}
                    </span>
                    <span style={{ marginLeft: '5px' }}>, arbitrated by</span>
                    <span
                        style={{
                            fontWeight: '700',
                            textDecoration: 'underline',
                            marginLeft: '5px',
                        }}
                    >
                        @{arbitrator}
                    </span>
                    <span>!</span>
                </div>

                {/* Claim content */}
                <div
                    style={{
                        display: 'flex',
                        marginBottom: '15px',
                    }}
                >
                    {claim}
                </div>

                {/* Add the sentence for asset and amount */}
                <div
                    style={{
                        display: 'flex',
                        fontSize: '40px',
                        marginTop: '20px',
                        fontWeight: '800',
                    }}
                >
                    for {amount} {asset}
                </div>
            </div>
        </div>
    );
}

export default BetView;