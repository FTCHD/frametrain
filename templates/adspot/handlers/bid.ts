'use server'
import type { BuildFrameData, FrameButtonMetadata, FramePayloadValidated } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import { getGlide } from '@/sdk/glide'
import { supportedChains } from '@/sdk/viem'
import { chains, createSession, currencies } from '@paywithglide/glide-js'
import ms from 'ms'
import type { Config, Storage } from '..'
import BuyView from '../views/Buy'
import initial from './initial'

export default async function bid({
    body,
    config,
    storage,
    params,
}: {
    body: FramePayloadValidated
    config: Config
    storage: Storage
    params?: any
}): Promise<BuildFrameData> {
    const buttons: FrameButtonMetadata[] = []
    if (params?.hasExpired === 'true') {
        return initial({ config, storage })
    }

    const fonts = await loadGoogleFontAllVariants('Roboto')
    const textInput = body.input?.text
    const bids = storage?.bids || []

    const currentBid = storage?.currentBid
        ? bids.find((bid) => bid.id === storage.currentBid)
        : null
    const winningBid =
        config.mode === 'continuous' && storage?.winningBid
            ? bids.find((bid) => bid.id === storage.winningBid)
            : null

    if (!(config.token?.chain && config.token?.symbol)) {
        throw new FrameError('Frame not fully configured')
    }

    if (!config.address) {
        throw new FrameError('Frame not fully configured')
    }

    if (config.mode === 'auction' && Date.now() > new Date(config.deadline).getTime()) {
        throw new FrameError('Auction has ended. You cannot bid at this moment.')
    }

    if (
        config.mode === 'continuous' &&
        winningBid &&
        Date.now() <= Number(winningBid.ts) + ms(config.deadline)
    ) {
        throw new FrameError('Ad slot has already been taken. You cannot bid at this moment.')
    }

    if (!textInput) {
        throw new FrameError('Bid amount is missing')
    }

    const amount = Number.parseFloat(textInput)

    if (isNaN(amount)) {
        throw new FrameError('Bid amount is invalid')
    }

    if ((currentBid && amount <= currentBid.amount) || (!currentBid && amount <= config.minBid)) {
        throw new FrameError(
            `Bid amount must be greater than ${currentBid ? currentBid.amount : config.minBid}`
        )
    }

    const bidChain = supportedChains.filter((chain) => chain.key === config.token!.chain)

    const bid = {
        id: crypto.randomUUID(),
        fid: body.interactor.fid,
        amount,
        ts: Date.now(),
        tx: null,
        approved: false,
    }

    bids.push(bid)

    const buildData: BuildFrameData = {
        buttons,
        fonts,
        handler: 'initial',
        component: BuyView({
            config,
            highestBid: currentBid || winningBid || null,
            chain: bidChain[0].label,
            bid,
            hasExpired: false,
        }),
        storage: {
            ...(storage || {}),
            bids,
            currentBid: bid.id,
        },
    }

    switch (config.mode) {
        case 'continuous': {
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
                    paymentAmount: amount,
                    chainId: glide.chains[0].id,
                    paymentCurrency: paymentCurrencyOnChain,
                    address: config.address as `0x${string}`,
                })

                buttons.push({
                    label: 'Buy',
                    action: 'tx',
                    handler: 'txData',
                })

                buildData['webhooks'] = [
                    {
                        event: 'adspot_new_bid',
                        data: { bid_mode: config.mode, bid },
                    },
                ]
                buildData.handler = 'success'
                buildData['params'] = {
                    sessionId: session.sessionId,
                }
            } catch (e) {
                console.error('Error creating session', e)
                throw new FrameError('Failed to create a payment session. Please try again')
            }
        }

        default: {
            buttons.push({
                label: 'Bid again',
            })
            break
        }
    }

    return buildData
}
