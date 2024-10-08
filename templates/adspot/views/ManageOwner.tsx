import type { Config } from '..'
import { FooterColumn, InfoBox, UserProfile } from '../Components'
import { formatDate, formatSymbol } from '../utils'

export default function ManageOwnerView({
    config,
    user,
    total,
}: { config: Config; user?: { displayName: string; pfp: { url: string } }; total: number }) {
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
                Statistics about your Ad Rental space
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
                            <InfoBox
                                title="Total bids(amount)"
                                label={formatSymbol(total, config.token!.symbol + '')}
                            />
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
                                title={'Expiry time'}
                                label={
                                    config.mode === 'auction'
                                        ? formatDate(new Date(config.deadline))
                                        : `${Number.parseInt(config.deadline)} hour(s)`
                                }
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div style={{ display: 'flex', gap: '48px', paddingTop: '16x' }}>
                <FooterColumn title="Highest bidder:">
                    {user ? (
                        <UserProfile description={user.displayName} image={user.pfp.url} />
                    ) : (
                        <span>N/A</span>
                    )}
                </FooterColumn>
            </div>
        </div>
    )
}
