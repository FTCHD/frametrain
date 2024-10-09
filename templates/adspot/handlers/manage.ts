'use server'
import type { BuildFrameData, FrameButtonMetadata, FramePayloadValidated } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import { getGlide } from '@/sdk/glide'
import { supportedChains } from '@/sdk/viem'
import { chains, createSession, currencies } from '@paywithglide/glide-js'
import type { Config, Storage } from '..'
import { fetchUser } from '../utils'
import ManageBidderView from '../views/ManageBidder'
import ManageOwnerView from '../views/ManageOwner'
import ManageWinnerView from '../views/ManageWinner'

export default async function manage({
    body,
    config,
    storage,
}: {
    body: FramePayloadValidated
    config: Config
    storage: Storage
}): Promise<BuildFrameData> {
    const chain = supportedChains.find((chain) => chain.key === config.token!.chain)

    if (!(chain && config.owner && config.token?.chain && config.token?.symbol && config.address)) {
        throw new FrameError('Frame not fully configured')
    }
    const fonts = await loadGoogleFontAllVariants('Nunito Sans')

    const fid = body.interactor.fid
    const bids = storage.bids || []
    const buttons: FrameButtonMetadata[] = [
        {
            label: 'Back',
        },
    ]
    const highestBid =
        config.mode === 'auction' && storage.currentBid
            ? storage.bids.find((bid) => bid.id === storage.currentBid)
            : null
    const winningBid =
        config.mode === 'continuous' && storage.winningBid
            ? bids.find((bid) => bid.id === storage.winningBid)
            : null
    const isOwner = config.owner.fid === fid
    const isWinner =
        config.mode === 'auction'
            ? bids.some((bid) => bid.fid === fid && bid.approved)
            : winningBid?.fid === fid

    const role = isOwner ? 'owner' : isWinner ? 'winner' : 'bidder'
    const buildData: BuildFrameData = {
        buttons,
        fonts,
        storage,
        handler: 'ad',
        params: {
            role,
        },
    }

    const total = { bids: bids.length, amount: bids.reduce((sum, bid) => sum + bid.amount, 0) }
    const myBids = bids.filter((bid) => bid.fid === fid)

    switch (role) {
        case 'owner': {
            const url = new URL(body.url)
            const paths = url.pathname.split('/')
            url.pathname = paths.slice(0, paths.length - 1).join('/') + '/show'
            buttons.push({
                label: 'Check bids',
                action: 'link',
                target: `${url.origin}${url.pathname.replace('/p/', '/f/')}`,
            })
            const user = highestBid ? await fetchUser(highestBid.fid) : undefined
            // count all bidded amount
            buildData['component'] = ManageOwnerView({ config, total, user })
            break
        }
        case 'winner': {
            const winnerBid = bids.find((bid) => bid.fid === fid && bid.approved)

            if (config.mode === 'auction') {
                if (!winnerBid) {
                    throw new FrameError('Your bid has not been approved.')
                }

                if (!winnerBid?.tx) {
                    const glide = getGlide(config.token.chain)

                    const chain = Object.keys(chains).find(
                        (chain) => (chains as any)[chain].id === glide.chains[0].id
                    )

                    if (!chain) {
                        throw new FrameError('Chain not found for the given chain ID.')
                    }

                    try {
                        const paymentCurrencyOnChain = (currencies as any)[
                            config.token.symbol.toLowerCase()
                        ].on((chains as any)[chain])

                        const session = await createSession(glide, {
                            paymentAmount: winnerBid?.amount,
                            chainId: glide.chains[0].id,
                            paymentCurrency: paymentCurrencyOnChain,
                            address: config.address as `0x${string}`,
                        })

                        // update id with session id
                        winnerBid.id = session.sessionId

                        buttons.push({
                            label: 'Pay',
                            action: 'tx',
                            handler: 'txData',
                        })

                        buildData['params'] = {
                            ...buildData['params'],
                            sessionId: session.sessionId,
                        }

                        buildData['component'] = ManageWinnerView({
                            config,
                            ad: storage.ad,
                            bid: winnerBid,
                        })
                    } catch (e) {
                        console.error('Error creating session', e)
                        throw new FrameError('Failed to create a payment session. Please try again')
                    }

                    break
                }
            }

            buildData['component'] = ManageWinnerView({
                config,
                ad: storage.ad,
                bid: config.mode === 'continuous' ? winningBid!! : winnerBid!!,
            })
            break
        }

        default: {
            const user = await fetchUser(config.owner.fid)
            buttons.push({
                label: 'Bid',
            })
            buildData['component'] = ManageBidderView({
                config,
                bids: myBids,
                chainName: chain.label,
                user,
            })
            buildData['inputText'] = 'Amount to bid'
            break
        }
    }

    buildData['buttons'] = buttons

    return buildData
}
