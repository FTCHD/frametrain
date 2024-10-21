import type { Config, Role } from '..'

export default function BetView(
    config: Config,
    winner: string | null,
    opponentAccepted: boolean,
    role: Role
) {
    const {
        background,
        textColor,
        claim = 'No claim specified',
        owner = { username: 'Unknown owner' },
        opponent = { username: 'Unknown opponent' },
        arbitrator = { username: 'Unknown arbitrator' },
        token = { id: '0x0000000000000000000000000000000000000000', name: 'Unknown token' },
        amount = '0',
        privacy = false,
    } = config

    const backgroundProp: Record<string, string> = {}

    if (background) {
        if (background.startsWith('#')) {
            backgroundProp['backgroundColor'] = background
        } else {
            backgroundProp['backgroundImage'] = background
        }
    } else {
        backgroundProp['backgroundImage'] = 'linear-gradient(to right, #0f0c29, #0b6bcb, #0f0c29)'
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
                        marginTop: '20px',
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
                        @{owner?.username}
                    </span>
                    <span style={{ marginLeft: '5px' }}>and</span>
                    <span
                        style={{
                            fontWeight: '700',
                            textDecoration: 'underline',
                            marginLeft: '5px',
                        }}
                    >
                        @{opponent?.username}
                    </span>
                    {(!privacy || role != 'user') && (
                        <>
                            <span style={{ marginLeft: '5px' }}>, arbitrated by</span>
                            <span
                                style={{
                                    fontWeight: '700',
                                    textDecoration: 'underline',
                                    marginLeft: '5px',
                                }}
                            >
                                @{arbitrator?.username}
                            </span>
                        </>
                    )}
                    <span>!</span>
                </div>

                {/* Add the sentence for token and amount */}
                {(!privacy || role != 'user') && (
                    <div
                        style={{
                            display: 'flex',
                            fontSize: '40px',
                            marginBottom: '20px',
                            fontWeight: '800',
                        }}
                    >
                        prize: {amount} {token.name}
                    </div>
                )}

                {/* Claim content */}
                {(!privacy || role != 'user') && (
                    <div
                        style={{
                            display: 'flex',
                            marginBottom: '20px',
                        }}
                    >
                        {claim}
                    </div>
                )}

                {/* Add msg according to role */}
                {role === 'opponent' && winner == null && (
                    <div
                        style={{
                            display: 'flex',
                            fontSize: '40px',
                            marginBottom: '20px',
                            fontWeight: '800',
                        }}
                    >
                        {opponentAccepted ? "You've accepted the bet" : 'Do you accept this bet?'}
                    </div>
                )}

                {/* Add winner information */}
                {winner && (
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            fontSize: '40px',
                            fontWeight: '800',
                        }}
                    >
                        <p style={{ marginBottom: '10px' }}>The bet has been settled!</p>
                        <p>Winner: @{winner}</p>
                    </div>
                )}
            </div>
        </div>
    )
}
