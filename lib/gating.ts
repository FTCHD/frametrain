import { GATING_ADVANCED_OPTIONS, type GATING_ALL_OPTIONS } from '@/sdk/components/gating/constants'
import type { GatingRequirementsType, GatingType } from '@/sdk/components/gating/types'
import { FrameError } from '@/sdk/error'
import { getFarcasterUserChannels } from '@/sdk/neynar'
import {
    http,
    createPublicClient,
    erc20Abi,
    erc721Abi,
    formatUnits,
    getAddress,
    getContract,
    parseAbi,
} from 'viem'
import type { Chain } from 'viem'
import { arbitrum, base, blast, bsc, fantom, mainnet, optimism, polygon, zora } from 'viem/chains'
import type { FrameValidatedActionPayload } from './farcaster'

const ERC1155_ABI = parseAbi([
    'function name() public view returns (string)',
    'function symbol() public view returns (string)',
    'function balanceOf(address _owner, uint256 _id) public view returns (uint256)',
])

export function getViemClient(network: string) {
    const networkToChainMap: Record<string, Chain> = {
        'ETH': mainnet,
        'BASE': base,
        'OP': optimism,
        'ZORA': zora,
        'BLAST': blast,
        'POLYGON': polygon,
        'FANTOM': fantom,
        'ARBITRUM': arbitrum,
        'BNB': bsc,
    }

    const chain = networkToChainMap[network]

    if (!chain) {
        throw new FrameError('Unsupported chain')
    }

    return createPublicClient({
        chain,
        transport: http(),
        batch: { multicall: { wait: 10, batchSize: 1000 } },
    })
}

async function checkOpenRankScore(fid: number, owner: number, score: number) {
    const url = `https://graph.cast.k3l.io/scores/personalized/engagement/fids?k=${score}&limit=1000&lite=true`
    const options = {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify([owner]),
    }

    try {
        const response = await fetch(url, options)
        const data = (await response.json()) as {
            result: { fid: number; score: number }[]
        }

        const isPositive = data.result.some((item) => item.fid === fid)
        if (!isPositive) {
            throw new FrameError(`You must have a score of at least ${score}.`)
        }
    } catch {
        throw new FrameError('Could not fetch your OpenRank data.')
    }
}

async function checkOwnsErc20(
    addresses: string[],
    chain: string,
    contract: string,
    symbol: string,
    minAmount = 1
) {
    const token = getContract({
        client: getViemClient(chain),
        address: getAddress(contract),
        abi: erc20Abi,
    })

    const decimals = await token.read.decimals()

    for (const ownerAddress of addresses) {
        const owner = getAddress(ownerAddress)
        const balanceOf = await token.read.balanceOf([owner])
        const balance = formatUnits(balanceOf, decimals)

        if (Number(balance) >= minAmount) {
            return
        }
    }

    throw new FrameError(`You must have at least ${minAmount} ${symbol}.`)
}

async function checkOwnsErc721(
    addresses: string[],
    chain: string,
    contract: string,
    symbol: string,
    minAmount = 1
) {
    const token = getContract({
        client: getViemClient(chain),
        address: getAddress(contract),
        abi: erc721Abi,
    })

    for (const ownerAddress of addresses) {
        const owner = getAddress(ownerAddress)
        const balanceOf = await token.read.balanceOf([owner])
        const balance = Number(balanceOf)

        if (balance >= minAmount) {
            return
        }
    }

    throw new FrameError(`You must have at least ${minAmount} ${symbol}.`)
}

async function checkOwnsErc1155(
    addresses: string[],
    chain: string,
    contract: string,
    symbol: string,
    tokenId: number,
    minAmount = 1
) {
    const token = getContract({
        client: getViemClient(chain),
        address: getAddress(contract),
        abi: ERC1155_ABI,
    })

    for (const ownerAddress of addresses) {
        const owner = getAddress(ownerAddress)
        const balanceOf = await token.read.balanceOf([owner, BigInt(tokenId)])
        const balance = Number(balanceOf)

        if (balance >= minAmount) {
            return
        }
    }

    throw new FrameError(`You must have at least ${minAmount} ${symbol}.`)
}

async function checkChannelMembership(fid: number, channel: string) {
    const userChannels = await getFarcasterUserChannels(fid)
    if (!userChannels.map((c) => c.id).includes(channel)) {
        throw new FrameError(`You must be a member of /${channel} channel.`)
    }
}

async function checkFid(fid: number, minFid: number, maxFid: number) {
    if (minFid > 0 && fid < minFid) {
        throw new FrameError(`FID must be greater than or equal to ${minFid}.`)
    }

    if (maxFid > 0 && fid >= maxFid) {
        throw new FrameError(`FID must be less than or equal to ${maxFid}.`)
    }
}

async function checkLiked(body: {
    validatedData: { cast: { viewer_context: { liked: boolean } } }
}) {
    if (!body.validatedData.cast.viewer_context.liked) {
        throw new FrameError('You must like this frame.')
    }
}

async function checkRecasted(body: {
    validatedData: { cast: { viewer_context: { recasted: boolean } } }
}) {
    if (!body.validatedData.cast.viewer_context.recasted) {
        throw new FrameError('You must recast this frame.')
    }
}

async function checkFollowingMe(body: {
    validatedData: { interactor: { viewer_context: { following: boolean } } }
}) {
    if (!body.validatedData.interactor.viewer_context.following) {
        throw new FrameError('You must follow the creator.')
    }
}

async function checkFollowedByMe(body: {
    validatedData: { interactor: { viewer_context: { followed_by: boolean } } }
}) {
    if (!body.validatedData.interactor.viewer_context.followed_by) {
        throw new FrameError('You must be followed by the creator.')
    }
}

async function checkEthWallet(body: {
    validatedData: { interactor: { verified_addresses: { eth_addresses: string[] } } }
}) {
    if (!body.validatedData.interactor.verified_addresses.eth_addresses.length) {
        throw new FrameError('You must have an Ethereum wallet.')
    }
}

async function checkSolWallet(body: {
    validatedData: { interactor: { verified_addresses: { sol_addresses: string[] } } }
}) {
    if (!body.validatedData.interactor.verified_addresses.sol_addresses.length) {
        throw new FrameError('You must have a Solana wallet.')
    }
}

const keyToValidator: Record<
    (typeof GATING_ALL_OPTIONS)[number],
    (requirements: GatingRequirementsType, body: any) => Promise<void>
> = {
    channels: async (requirements, body) => {
        for (const channel of requirements['channels']!) {
            await checkChannelMembership(body.validatedData.interactor.fid, channel)
        }
    },
    followedByMe: async (_requirements, body) => await checkFollowedByMe(body),
    followingMe: async (_requirements, body) => await checkFollowingMe(body),
    liked: async (_requirements, body) => await checkLiked(body),
    recasted: async (_requirements, body) => await checkRecasted(body),
    eth: async (_requirements, body) => await checkEthWallet(body),
    sol: async (_requirements, body) => await checkSolWallet(body),
    minFid: async (requirements, body) =>
        await checkFid(body.validatedData.interactor.fid, requirements['minFid']!, 0),
    maxFid: async (requirements, body) =>
        await checkFid(body.validatedData.interactor.fid, 0, requirements['maxFid']!),
    exactFids: async (requirements, body) => {
        for (const fid of requirements['exactFids']!) {
            await checkFid(body.validatedData.interactor.fid, fid, fid)
        }
    },
    erc20: async (requirements, body) => {
        for (const token of requirements['erc20']!) {
            await checkOwnsErc20(
                body.validatedData.interactor.verified_addresses.eth_addresses,
                token.network,
                token.address,
                token.symbol,
                token.balance
            )
        }
    },
    erc721: async (requirements, body) => {
        for (const token of requirements['erc721']!) {
            await checkOwnsErc721(
                body.validatedData.interactor.verified_addresses.eth_addresses,
                token.network,
                token.address,
                token.symbol,
                token.balance
            )
        }
    },
    erc1155: async (requirements, body) => {
        for (const token of requirements['erc1155']!) {
            await checkOwnsErc1155(
                body.validatedData.interactor.verified_addresses.eth_addresses,
                token.network,
                token.address,
                token.symbol,
                token.tokenId!,
                token.balance
            )
        }
    },
    score: async (requirements, body) =>
        await checkOpenRankScore(
            body.validatedData.interactor,
            requirements['score']!.owner,
            requirements['score']!.score
        ),
}

export async function runGatingChecks(
    body: FrameValidatedActionPayload,
    config: GatingType | undefined
): Promise<void> {
    if (!config) {
        return
    }

    for (const key of config.enabled) {
        // handle case where this check is enabled, but not configured
        if (
            GATING_ADVANCED_OPTIONS.includes(key) &&
            !config.requirements[key as keyof GatingRequirementsType]
        ) {
            continue
        }
        const validator = keyToValidator[key as keyof GatingRequirementsType]
        await validator(config.requirements, body)
    }
}
