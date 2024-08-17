'use server'
import type {
    BuildFrameData,
    FrameButtonMetadata,
    FrameValidatedActionPayload,
} from '@/lib/farcaster'
import {
    checkErcTokenOwnership,
    checkFarcasterChannelsMembership,
    checkFollowStatus,
    checkOpenRankScore,
} from '@/lib/gating'
import { FrameError } from '@/sdk/error'
import type { Config } from '..'
import NopeView from '../views/Nope'
import PageView from '../views/Page'

export default async function page({
    body,
    config,
}: {
    body: FrameValidatedActionPayload
    config: Config
    storage: Storage
    params: any
}): Promise<BuildFrameData> {
    const viewer = body.validatedData.interactor
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
        throw new FrameError('Frame Owner not configured')
    }

    if (config.requirements.recasted && !cast.viewer_context.recasted) {
        errors.push({ message: 'recast', type: 'ctx' })
    } else if (config.requirements.liked && !cast.viewer_context.liked) {
        errors.push({ message: 'like', type: 'ctx' })
    } else if (config.requirements.following || config.requirements.followedBy) {
        const status = await checkFollowStatus(config.owner.fid, viewer.fid)
        if (config.requirements.following && !status.following) {
            errors.push({ message: `follow @${config.username}`, type: 'follow' })
        } else if (config.requirements.followedBy && !status.followed_by) {
            errors.push({
                message: `be followed by @${config.owner.username}`,
                type: 'follow',
            })
        }
        errors.push({ message: `follow @${config.username}`, type: 'follow' })
    } else if (config.requirements.powerBadge && !viewer.power_badge) {
        errors.push({ message: 'power badge user', type: 'be' })
    } else if (config.requirements.eth && !viewer.verified_addresses.eth_addresses.length) {
        errors.push({ message: 'an ethereum', type: 'wallets' })
    } else if (config.requirements.sol && !viewer.verified_addresses.sol_addresses.length) {
        errors.push({ message: 'a solana', type: 'wallets' })
    }

    if (!errors.length) {
        if (config.requirements.maxFid > 0 && viewer.fid >= config.requirements.maxFid) {
            errors.push({
                message: `an FID less than ${config.requirements.maxFid}`,
                type: 'have',
            })
        } else if (config.requirements.score > 0) {
            const containsUserFID = await checkOpenRankScore(
                viewer.fid,
                config.owner.fid,
                config.requirements.score
            )

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
            const channels = await checkFarcasterChannelsMembership(
                viewer.fid,
                config.requirements.channels.data
            )

            if (channels.length) {
                errors.push({
                    message: `joined "${channels.join(', ')}" channels`,
                    type: 'have',
                })
            }
        } else if (config.requirements.erc20?.address && config.requirements.erc20.network) {
            //
            try {
                const tokenInfo = await checkErcTokenOwnership({
                    addresses: viewer.verified_addresses.eth_addresses,
                    chain: config.requirements.erc20.network,
                    contractAddress: config.requirements.erc20.address,
                    erc: '20',
                    minAmount: config.requirements.erc20.balance,
                })

                if (!tokenInfo.isHolding) {
                    if (!config.requirements.erc20.balance) {
                        errors.push({ message: tokenInfo.name, type: 'nft' })
                    } else {
                        errors.push({
                            message: `${config.requirements.erc20.balance} ${tokenInfo.name}`,
                            type: 'nft',
                        })
                    }
                }
            } catch {
                errors.push({ message: 'ERC-20 token', type: 'nft' })
            }
        } else if (
            config.requirements.erc1155?.address &&
            config.requirements.erc1155.network &&
            config.requirements.erc1155.tokenId
        ) {
            //
            try {
                const tokenInfo = await checkErcTokenOwnership({
                    addresses: viewer.verified_addresses.eth_addresses,
                    chain: config.requirements.erc1155.network,
                    contractAddress: config.requirements.erc1155.address,
                    erc: '1155',
                    tokenId: config.requirements.erc1155.tokenId,
                    minAmount: config.requirements.erc1155.balance,
                })

                if (!tokenInfo.isHolding) {
                    if (!config.requirements.erc1155.balance) {
                        errors.push({ message: tokenInfo.name, type: 'nft' })
                    } else {
                        errors.push({
                            message: `${config.requirements.erc1155.balance} ${tokenInfo.name}`,
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
            } catch {
                errors.push({ message: 'ERC-1155 token', type: 'error' })
            }
        } else if (config.requirements.erc721?.address && config.requirements.erc721.network) {
            //
            try {
                const tokenInfo = await checkErcTokenOwnership({
                    addresses: viewer.verified_addresses.eth_addresses,
                    chain: config.requirements.erc721.network,
                    contractAddress: config.requirements.erc721.address,
                    erc: '721',
                    minAmount: config.requirements.erc721.balance,
                })

                if (!tokenInfo.isHolding) {
                    if (!config.requirements.erc721.balance) {
                        errors.push({ message: tokenInfo.name, type: 'nft' })
                    } else {
                        errors.push({
                            message: `${config.requirements.erc721.balance} ${tokenInfo.name}`,
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
            } catch {
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
