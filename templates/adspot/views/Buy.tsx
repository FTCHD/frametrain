import type { Config, Storage } from '..'
import { formatDate, formatSymbol } from '../utils'

export default function BuyView({
    config,
    highestBid,
    chain,
    bid,
    hasExpired,
}: {
    config: Config
    highestBid: Storage['bids'][number] | null
    chain: string
    bid?: Storage['bids'][number]
    hasExpired: boolean
}) {
    const steps = {
        auction: [
            'Enter an amount to bid and click on "Bid". Must be more than the current highest bid.',
            'Make payment to validate your bid.',
            `After the deadline, if you are the winner, you get to place your ad in this frame's cover.`,
        ],
        continuous: [
            'Enter an amount to bid.',
            'You win the bid if it is higher than the initial bid.',
            'No one can bid after you have made payment. First come, first serve.',
            'You can set your ad image or/and link from Cover > ℹ️ > Manage',
            `Your ad runs for ${Number.parseInt(
                config.deadline
            )} hour(s), after which it gets reset and others can start bidding`,
        ],
    }

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
                Ad Rental space by @{config.owner!.fname}
            </div>
            {hasExpired ? (
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        alignItems: 'center',
                        flexGrow: 1,
                        padding: 32,
                        textAlign: 'center',
                        fontWeight: 600,
                        fontSize: 60,
                    }}
                >
                    Sorry, the deadline has expired! You cannot bid at this moment.
                </div>
            ) : bid && config.mode === 'auction' ? (
                <div tw="flex justify-center items-center text-3xl text-white text-center text-green-500 font-bold">
                    Your bid was successfully placed!
                </div>
            ) : (
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        padding: '40px 50px',
                    }}
                >
                    <h3
                        style={{
                            textAlign: 'left',
                            fontSize: '64px',
                        }}
                    >
                        How it works:
                    </h3>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            fontSize: '25px',
                            gap: '10px',
                            width: '100%',
                        }}
                    >
                        {steps[config.mode].map((step, i) => (
                            <span
                                key={i}
                                style={{
                                    opacity: '0.8',
                                    fontWeight: 'medium',
                                }}
                            >
                                {i + 1}. {step}
                            </span>
                        ))}
                    </div>
                </div>
            )}
            <div
                style={{
                    display: 'flex',
                    gap: '48px',
                    paddingTop: '16x',
                    padding: '40px 50px',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: '4px',
                    }}
                >
                    <span
                        style={{
                            fontSize: 18,
                            fontWeight: 600,
                        }}
                    >
                        Chain:
                    </span>
                    {chain}
                </div>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: '4px',
                    }}
                >
                    <span
                        style={{
                            fontSize: 18,
                            fontWeight: 600,
                        }}
                    >
                        Token:
                    </span>
                    {config.token!.symbol}
                </div>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: '4px',
                    }}
                >
                    <span
                        style={{
                            fontSize: 18,
                            fontWeight: 600,
                        }}
                    >
                        Starting Bid:
                    </span>
                    {formatSymbol(config.minBid, config.token!.symbol + '')}
                </div>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: '4px',
                    }}
                >
                    <span
                        style={{
                            fontSize: 18,
                            fontWeight: 600,
                        }}
                    >
                        Highest Bid:
                    </span>
                    {highestBid
                        ? formatSymbol(highestBid.amount, config.token!.symbol + '')
                        : bid
                          ? formatSymbol(bid.amount, config.token!.symbol + '')
                          : 'N/A'}
                </div>
                {bid ? (
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            gap: '4px',
                        }}
                    >
                        <span
                            style={{
                                fontSize: 18,
                                fontWeight: 600,
                            }}
                        >
                            Your Bid:
                        </span>
                        {formatSymbol(bid.amount, config.token!.symbol + '')}
                    </div>
                ) : null}
                {!hasExpired && (
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            gap: '4px',
                        }}
                    >
                        <span
                            style={{
                                fontSize: 18,
                                fontWeight: 600,
                            }}
                        >
                            {config.mode === 'continuous' ? 'Duration' : '(Deadline)'}:
                        </span>
                        {config.mode === 'auction'
                            ? formatDate(new Date(config.deadline))
                            : Number.parseInt(config.deadline) + ' hour(s)'}
                    </div>
                )}
            </div>
        </div>
    )
}
