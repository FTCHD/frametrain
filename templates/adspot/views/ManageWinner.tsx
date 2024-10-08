import type { Config } from '..'
import { FooterColumn, InfoBox } from '../Components'

export default function ManageWinnerView({
    ad,
    config,
}: {
    ad: {
        image: string
        url?: string
    } | null
    config: Config
}) {
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
                Your Ad
            </div>
            <div
                style={{
                    display: 'flex',
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'center',
                }}
            >
                {ad?.image ? (
                    <div tw="flex mx-auto w-[240px] h-[240px]">
                        <img
                            src={ad.image}
                            alt="add Pic"
                            width={250}
                            height={250}
                            tw="rounded-xl max-w-[240px]"
                            style={{
                                width: 250,
                                height: 250,
                                borderColor: config.productTitle?.color || 'white',
                                objectFit: 'cover',
                                borderRadius: '.75rem',
                            }}
                        />
                    </div>
                ) : (
                    <span>No Image</span>
                )}
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
                            <InfoBox title="Ad Link" label={ad?.url || 'N/A'} />
                        </div>
                    </div>
                </div>
            </div>
            <div style={{ display: 'flex', gap: '48px', paddingTop: '16x' }}>
                <FooterColumn title="Ad Expires">
                    {config.mode === 'auction'
                        ? config.deadline
                        : `${Number.parseInt(config.deadline)} hour(s)`}
                </FooterColumn>
            </div>
        </div>
    )
}
