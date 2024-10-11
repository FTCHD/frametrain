'use server'
import type { BuildFrameData, FramePayloadValidated } from '@/lib/farcaster'
import { runGatingChecks } from '@/lib/gating'
import { FrameError } from '@/sdk/error'
import BasicView from '@/sdk/views/BasicView'
import type { airdropChains, Config, Storage } from '..'
import { transferTokenToAddress, transferTokenToAddressUsingGlide } from '../utils/onchainUtils'
import ClaimedView from '../views/Claimed'
import PendingApprovalView from '../views/PendingApproval'
import { waitUntil } from '@vercel/functions'

export default async function page({
    body,
    config,
    storage,
    params,
}: {
    body: FramePayloadValidated
    config: Config
    storage: Storage
    params: any
}): Promise<BuildFrameData> {
    const {
        blacklist,
        whitelist,
        creatorId: creatorFid,
        generalAmount,
        enableGating,
        cooldown,
        chain,
        walletAddress,
        tokenAddress,
    } = config
    const { fid: viewerFid, verified_addresses } = body.interactor

    let paymentAmount = generalAmount
    let viewerFromStorage
    if (enableGating) {
        await runGatingChecks(body, config.gating)
    }
    if (!storage.users) {
        storage.users = {}
        viewerFromStorage = undefined
    } else {
        viewerFromStorage = storage.users[viewerFid]
    }

    //Skip if it's the user's first time. Check cool down time is not expired
    if (viewerFromStorage) {
        if (cooldown > -1) {
            const viewerFromStorage = storage.users[viewerFid]
            const now = Date.now()

            const lastUsage = viewerFromStorage?.lastUsage || 0
            const cooldownMs = cooldown * 1000
            const cooldownEndTime = lastUsage + cooldownMs

            if (now < cooldownEndTime) {
                const timeLeftInSeconds = Math.ceil((cooldownEndTime - now) / 1000)
                throw new FrameError(`Cooldown. claim again in: ${timeLeftInSeconds}s`)
            }
        }

        //Check if user has already claimed i.e colldowTime = -1
        else if (viewerFromStorage.claimed) {
            throw new FrameError('You can only claim once!')
        }
    }
    if (viewerFid == creatorFid) {
        //User is creator so return the approve screen
        return {
            buttons: [
                {
                    label: 'Approve',
                    action: 'tx',
                    handler: 'tx',
                },
            ],
            component: PendingApprovalView(config),
            handler: 'approve',
        }
    }

    const viewerAddresses = verified_addresses.eth_addresses

    //Get blacklist, whitelist or claimed
    for (let i = 0; i < viewerAddresses.length; i++) {
        const address = viewerAddresses[i]
        //Check blacklist
        if (blacklist.includes(address)) {
            throw new FrameError("You're not eligible to claim")
        }
        //Check whitelist
        const userInWhiteList = whitelist.find((item) => item.address === address)
        if (userInWhiteList) {
            paymentAmount = userInWhiteList.amount ?? generalAmount
            //No need for a user to be in both black and whitelist so just break
            break
        }
    }

    //Send airdrop amount to user
    const FRAME_TRAIN_OPERATOR_PRIVATE_KEY = process.env.FRAME_TRAIN_OPERATOR_PRIVATE_KEY
    if (!FRAME_TRAIN_OPERATOR_PRIVATE_KEY) {
        throw new FrameError('Frame operator details missing is not set')
    }
    const configuration = {
        operatorPrivateKey: FRAME_TRAIN_OPERATOR_PRIVATE_KEY,
        chain: chain,
        paymentAmount,
        receiverAddress: viewerAddresses[0] ?? body.interactor.custody_address,
        tokenAddress,
        walletAddress,
    }
    if (config.crossTokenEnabled && config.crossToken.chain && config.crossToken.symbol) {
        const chainName = config.chain === 'ethereum' ? 'mainnet' : config.chain
        const crossTokenKey = `${chainName}/${config.tokenAddress}`
        const crossTokens = config.crossTokens[crossTokenKey]

        const crossToken = crossTokens?.find(
            (token) =>
                token.currencySymbol === config.crossToken.symbol &&
                token.chainName.toLowerCase() === config.crossToken.chain
        )

        if (crossToken) {
            configuration.chain = crossToken.chainName.toLowerCase() as keyof typeof airdropChains
            //Wait until ensure the transaction is at least sent before the frame returns
            waitUntil(transferTokenToAddressUsingGlide(configuration, crossToken, config))
        }
    }
    if (!config.crossTokenEnabled) {
        transferTokenToAddress(configuration)
    }

    //Update storage
    const newStorage = {
        ...storage,
        users: {
            ...storage.users,
            [viewerFid]: {
                claimed: true,
                lastUsage: Date.now(),
                username: body.interactor.username,
                fid: viewerFid,
                earnings: viewerFromStorage?.earnings
                    ? viewerFromStorage.earnings + paymentAmount
                    : paymentAmount,
            },
        },
        totalAmountEarned: (storage.totalAmountEarned ?? 0) + paymentAmount,
    }

    return {
        buttons: [
            {
                label: 'Home 🏡',
            },
        ],
        storage: newStorage,
        component: ClaimedView(),
        handler: 'initial',
    }
}
