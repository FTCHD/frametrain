import type { Config } from '..'
import { FooterColumn, InfoBox, UserProfile } from '../Components'
import { formatSymbol } from '../utils'

function shortenHash(hash: string) {
    return hash.slice(0, 10) + '...' + hash.slice(-10)
}

export default function InfoView({
    config,
    user,
    chainName,
}: { config: Config; user: { displayName: string; pfp: { url: string } }; chainName: string }) {
    return (
        <div
            style={{
                height: '100%',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                backgroundImage: 'linear-gradient(to top left,#AC32E4,#7918F2,#4801FF)',
                color: '#E2E2E2',
                fontSize: 32,
                padding: '10px',
                fontFamily: 'Nunito Sans',
                fontWeight: 400,
            }}
        >
            <div
                style={{
                    display: 'flex',
                    flex: 1,
                    alignItems: 'center',
                    fontSize: '48px',
                    fontWeight: 600,
                    textShadow: '0px 4px 4px rgba(255, 255, 255, 0.08)',
                    justifyContent: 'center',
                }}
            >
                Ad Rental space by {user.displayName}
            </div>
            <div
                style={{
                    display: 'flex',
                    flex: 1,
                    flexDirection: 'column',
                    justifyContent: 'center',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        width: '100%',
                        flexDirection: 'row',
                        borderRadius: '32px',
                        padding: '24px 32px',
                        border: '1px solid rgba(0, 0, 0, 0.08)',
                        boxShadow: 'inset 3px 3px 15px 3px rgba(11, 11, 15, 0.08)',
                        background: 'rgb(221, 221, 221)',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            flex: 1,
                            gap: '24px',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '24px',
                                flex: 1,
                            }}
                        >
                            <InfoBox title="Bid Mode" label={config.mode.toUpperCase()} />
                        </div>
                        <div
                            style={{
                                width: 1,
                                height: '100%',
                                backgroundColor: 'rgba(0, 0, 0, 0.08)',
                            }}
                        />
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '24px',
                                flex: 1,
                            }}
                        >
                            <InfoBox
                                title={config.mode === 'auction' ? 'Deadline' : 'Duration'}
                                label={
                                    config.mode === 'auction'
                                        ? config.deadline
                                        : `${Number.parseInt(config.deadline)} hour(s)`
                                }
                            />
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '24px',
                                flex: 1,
                            }}
                        >
                            <InfoBox
                                title="Minimum bid"
                                label={formatSymbol(config.minBid, config.token!.symbol + '')}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div style={{ display: 'flex', gap: '48px', paddingTop: '16x' }}>
                <FooterColumn title="Token:">
                    <span> {config.token!.symbol}</span>
                </FooterColumn>
                <FooterColumn title="Chain:">
                    <span>{chainName}</span>
                </FooterColumn>
                <FooterColumn title="Owner Address:">
                    <span>{shortenHash(config.address + '')}</span>
                </FooterColumn>
                <FooterColumn title="Owner:">
                    <UserProfile description={user.displayName} image={user.pfp.url} />
                </FooterColumn>
            </div>
        </div>
    )
}
