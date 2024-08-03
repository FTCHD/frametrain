'use server'
import type {
    BuildFrameData,
    FrameButtonMetadata,
    FrameValidatedActionPayload,
} from '@/lib/farcaster'
import type { Config } from '..'
import PageView from '../views/Page'
import { FrameError } from '@/sdk/error'
import NopeView from '../views/Nope'
import { getFarcasterUserChannels } from '@/sdk/neynar'
import { holdsToken } from '../utils/nft'
import { formatUnits, parseUnits } from 'viem'

export default async function page({
    body,
    config,
}: {
    body: FrameValidatedActionPayload
    config: Config
    storage: Storage
    params: any
}): Promise<BuildFrameData> {
    const user = body.validatedData.interactor
    const cast = body.validatedData.cast
    const errors: {
        message: string
        type: string
    }[] = []
    const buttons: FrameButtonMetadata[] = [
        {
            label: 'Try again',
        },
    ]

    if (!config.owner) {
        throw new FrameError('Frame not configured')
    }

    if (config.requirements?.basic) {
        if (config.requirements.basic.casted && !cast.viewer_context.recasted) {
            errors.push({ message: 'recast', type: 'ctx' })
        } else if (config.requirements.basic.liked && !cast.viewer_context.liked) {
            errors.push({ message: 'like', type: 'ctx' })
        } else if (config.requirements.basic.following && !user.viewer_context.following) {
            errors.push({ message: `follow @${config.username}`, type: 'follow' })
        } else if (config.requirements.basic.follower && !user.viewer_context.followed_by) {
            errors.push({
                message: `be a follower of @${config.owner.username}`,
                type: 'follow',
            })
        } else if (config.requirements.basic.power && !user.power_badge) {
            errors.push({ message: 'power badge user', type: 'be' })
        } else if (config.requirements.basic.eth && !user.verified_addresses.eth_addresses.length) {
            errors.push({ message: 'an ethereum', type: 'wallets' })
        } else if (config.requirements.basic.sol && !user.verified_addresses.sol_addresses.length) {
            errors.push({ message: 'a solana', type: 'wallets' })
        }
    }
    if (!errors.length) {
        if (config.requirements.maxFid > 0 && user.fid >= config.requirements.maxFid) {
            errors.push({
                message: `an FID less than ${config.requirements.maxFid}`,
                type: 'have',
            })
        } else if (config.requirements.score > 0) {
            const fetchScore = async (fid: number) => {
                const url =
                    'https://graph.cast.k3l.io/scores/personalized/engagement/fids?k=1&limit=1000&lite=true'
                const options = {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify([config.owner?.fid]),
                }

                try {
                    const response = await fetch(url, options)
                    const data = (await response.json()) as {
                        result: { fid: number; score: number }[]
                    }

                    const containsUserFID = data.result.some((item) => item.fid === fid)

                    return containsUserFID
                } catch {
                    return false
                }
            }
            const containsUserFID = await fetchScore(user.fid)

            if (!containsUserFID) {
                errors.push({
                    message: `an Open Rank score closer to that of @${config.owner.username}`,
                    type: 'have',
                })
            }
        } else if (
            config.requirements.channels.checked &&
            config.requirements.channels.data.length
        ) {
            const channels = await getFarcasterUserChannels(user.fid)

            const missingChannels = config.requirements.channels.data.filter(
                (channel) => !channels.map((c) => c.id).includes(channel)
            )

            if (missingChannels.length) {
                // prefix channels with /
                missingChannels.forEach((channel, index) => {
                    missingChannels[index] = `/${channel}`
                })
                errors.push({
                    message: `joined "${missingChannels.join(', ')}" channels`,
                    type: 'have',
                })
            }
        } else if (config.requirements.erc20?.address && config.requirements.erc20.network) {
            //
            try {
                const tokenInfo = await holdsToken({
                    addresses: user.verified_addresses.eth_addresses,
                    chain: config.requirements.erc20.network,
                    contractAddress: config.requirements.erc20.address,
                    erc: '20',
                })

                const balances = tokenInfo.balances.map((balance) =>
                    Number(formatUnits(BigInt(balance), tokenInfo.decimals))
                )
                const minimumBalance = config.requirements.erc20.balance

                const isHolding = minimumBalance
                    ? balances.some((balance) => balance >= minimumBalance)
                    : true

                if (!isHolding) {
                    if (!minimumBalance) {
                        errors.push({ message: tokenInfo.name, type: 'nft' })
                    } else {
                        errors.push({
                            message: `${minimumBalance} ${tokenInfo.name}`,
                            type: 'nft',
                        })
                    }
                }
            } catch (error) {
                console.error(
                    `Error checking ERC-20 on ${config.requirements.erc20.network}`,
                    error
                )

                errors.push({ message: 'ERC-20 token', type: 'nft' })
            }
        } else if (
            config.requirements.erc1155?.address &&
            config.requirements.erc1155.network &&
            config.requirements.erc1155.tokenId
        ) {
            //
            try {
                const tokenInfo = await holdsToken({
                    addresses: user.verified_addresses.eth_addresses,
                    chain: config.requirements.erc1155.network,
                    contractAddress: config.requirements.erc1155.address,
                    erc: '1155',
                    tokenId: config.requirements.erc1155.tokenId,
                })

                const balances = tokenInfo.balances.map((balance) =>
                    Number(formatUnits(BigInt(balance), tokenInfo.decimals))
                )
                const minimumBalance = config.requirements.erc1155.balance
                    ? Number(
                          parseUnits(`${config.requirements.erc1155.balance}`, tokenInfo.decimals)
                      )
                    : null
                const isHolding = minimumBalance
                    ? balances.some((balance) => balance >= minimumBalance)
                    : true

                if (!isHolding) {
                    if (!minimumBalance) {
                        errors.push({ message: tokenInfo.name, type: 'nft' })
                    } else {
                        errors.push({
                            message: `${minimumBalance} ${tokenInfo.name}`,
                            type: 'nft',
                        })
                    }
                    if (config.requirements.erc1155.collection) {
                        buttons.push({
                            label: 'View Collection',
                            action: 'link',
                            target: config.requirements.erc1155.collection,
                        })
                    }
                }
            } catch (error) {
                console.error(
                    `Error checking ERC-1155 on ${config.requirements.erc1155.network}`,
                    error
                )

                errors.push({ message: 'ERC-1155 token', type: 'error' })
            }
        } else if (config.requirements.erc721?.address && config.requirements.erc721.network) {
            //
            try {
                const tokenInfo = await holdsToken({
                    addresses: user.verified_addresses.eth_addresses,
                    chain: config.requirements.erc721.network,
                    contractAddress: config.requirements.erc721.address,
                    erc: '721',
                })
                const balances = tokenInfo.balances.map((balance) =>
                    Number(formatUnits(BigInt(balance), tokenInfo.decimals))
                )
                const minimumBalance = config.requirements.erc721.balance
                    ? Number(
                          parseUnits(`${config.requirements.erc721.balance}`, tokenInfo.decimals)
                      )
                    : null
                const isHolding = minimumBalance
                    ? balances.some((balance) => balance >= minimumBalance)
                    : true

                if (!isHolding) {
                    if (!minimumBalance) {
                        errors.push({ message: tokenInfo.name, type: 'nft' })
                    } else {
                        errors.push({
                            message: `${minimumBalance} ${tokenInfo.name}`,
                            type: 'nft',
                        })
                    }
                    if (config.requirements.erc721.collection) {
                        buttons.push({
                            label: 'View Collection',
                            action: 'link',
                            target: config.requirements.erc721.collection,
                        })
                    }
                }
            } catch (error) {
                console.error(
                    `Error checking ERC-721 on ${config.requirements.erc721.network}`,
                    error
                )

                errors.push({ message: 'an ERC-721', type: 'nft' })
            }
        }
    }

    if (errors.length) {
        return {
            buttons,
            component: NopeView({ errors }),
            handler: 'page',
        }
    }

    buttons.length = 0

    if (config.links.length) {
        config.links.forEach((link, i) => {
            buttons.push({
                label: `Reward #${i + 1}`,
                action: 'link',
                target: link,
            })
        })
    } else {
        buttons.push({
            label: 'Create Your Own Frame',
            action: 'link',
            target: 'https://frametra.in',
        })
    }

    return {
        buttons,
        component: config.rewardImage ? undefined : PageView(config),
        image: config.rewardImage || undefined,
    }
}
