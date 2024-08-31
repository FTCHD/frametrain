import type { GatingOptionsProps } from '@/sdk/components/GatingOptions'
import { FrameError } from '@/sdk/error'
import { getFarcasterUserChannels } from '@/sdk/neynar'
import { http, createPublicClient, formatUnits, getAddress, getContract, parseAbi } from 'viem'
import type { Chain } from 'viem'
import { arbitrum, base, blast, bsc, fantom, mainnet, optimism, polygon, zora } from 'viem/chains'
import type { FrameValidatedActionPayload } from './farcaster'

function getViemClient(network: string) {
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

const ERC20_ABI = parseAbi([
    'function name() public view returns (string)',
    'function decimals() public view returns (uint8)',
    'function balanceOf(address _owner) public view returns (uint256 balance)',
])

const ERC721_ABI = parseAbi([
    'function name() public view returns (string)',
    'function balanceOf(address _owner) public view returns (uint256 balance)',
])

const ERC1155_ABI = parseAbi([
    'function name() public view returns (string)',
    'function balanceOf(address _owner, uint256 _id) public view returns (uint256)',
])

export async function checkOpenRankScore(fid: number, owner: number, score: number) {
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
        throw new FrameError('Failed to fetch your engagement data')
    }
}

async function checkOwnsErc20(
    addresses: string[],
    chain: string,
    contract: string,
    minAmount?: number
) {
    const client = getViemClient(chain)
    const address = getAddress(contract)
    const token = getContract({
        client,
        address,
        abi: ERC20_ABI,
    })
    const name = await token.read.name()
    const decimals = await token.read.decimals()
    const balances: number[] = []

    if (minAmount) {
        for (const ownerAddress of addresses) {
            const owner = getAddress(ownerAddress)
            const balanceOf = await token.read.balanceOf([owner])
            const balance = formatUnits(balanceOf, decimals)
            balances.push(Number(balance) >= minAmount ? Number(balance) : 1)
        }
    }

    const isHolding = balances.some((bal) => bal > 0)

    if (!isHolding) {
        throw new FrameError(`You must have at least ${minAmount} ${name}.`)
    }
}

async function checkOwnsErc721(
    addresses: string[],
    chain: string,
    contract: string,
    minAmount?: number
) {
    const client = getViemClient(chain)
    const address = getAddress(contract)
    const token = getContract({
        client,
        address,
        abi: ERC721_ABI,
    })
    const name = await token.read.name()
    const balances: number[] = []

    if (minAmount) {
        for (const ownerAddress of addresses) {
            const owner = getAddress(ownerAddress)
            const balanceOf = await token.read.balanceOf([owner])
            const balance = Number(balanceOf)
            balances.push(balance >= minAmount ? balance : 1)
        }
    }

    const isHolding = balances.some((bal) => bal > 0)

    if (!isHolding) {
        throw new FrameError(`You must have at least ${minAmount} ${name}.`)
    }
}

async function checkOwnsErc1155(
    addresses: string[],
    chain: string,
    contract: string,
    tokenId: number,
    minAmount?: number
) {
    const client = getViemClient(chain)
    const address = getAddress(contract)
    const token = getContract({
        client,
        address,
        abi: ERC1155_ABI,
    })
    const name = await token.read.name()
    const balances: number[] = []

    if (minAmount) {
        for (const ownerAddress of addresses) {
            const owner = getAddress(ownerAddress)
            const balanceOf = await token.read.balanceOf([owner, BigInt(tokenId)])
            const balance = Number(balanceOf)
            balances.push(balance >= minAmount ? balance : 1)
        }
    }

    const isHolding = balances.some((bal) => bal > 0)

    if (!isHolding) {
        throw new FrameError(`You must have at least ${minAmount} ${name}.`)
    }
}

async function checkChannelMembership(fid: number, channel: string) {
    const userChannels = await getFarcasterUserChannels(fid)
    if (!userChannels.map((c) => c.id).includes(channel)) {
        throw new FrameError(`You must be a member of /${channel} channel.`)
    }
}

async function checkFid(fid: number, minFid: number, maxFid: number) {
    if (minFid > 0 && fid < minFid) {
        throw new FrameError(`You must have an FID greater than ${minFid}.`)
    }

    if (maxFid > 0 && fid >= maxFid) {
        throw new FrameError(`You must have an FID less than ${maxFid}.`)
    }
}

async function checkLiked(body: {
    validatedData: { cast: { liked: boolean } }
}) {
    if (!body.validatedData.cast.liked) {
        throw new FrameError('You must like this frame.')
    }
}

async function checkRecasted(body: {
    validatedData: { cast: { recasted: boolean } }
}) {
    if (!body.validatedData.cast.recasted) {
        throw new FrameError('You must recast this frame.')
    }
}

async function checkFollowing(body: {
    validatedData: { interactor: { viewer_context: { following: boolean } } }
}) {
    if (!body.validatedData.interactor.viewer_context.following) {
        throw new FrameError('You must follow the creator.')
    }
}

async function checkFollowedBy(body: {
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

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
export async function runGatingChecks(
    body: FrameValidatedActionPayload,
    config: {
        gating: GatingOptionsProps['config'] | null
        owner: {
            fid: number
            username: string
        } | null
    }
): Promise<void> {
    if (!config.gating) {
        return
    }
    if (!config.owner) {
        throw new FrameError('Frame Owner not configured')
    }
    if (config.gating.recasted && !body.validatedData.cast.recasted) {
        await checkRecasted(body)
    } else if (config.gating.liked && !body.validatedData.cast.liked) {
        await checkLiked(body)
    } else if (config.gating.following && !body.validatedData.following) {
        await checkFollowing(body)
    } else if (config.gating.followedBy && !body.validatedData.followed_by) {
        await checkFollowedBy(body)
    } else if (
        config.gating.eth &&
        !body.validatedData.interactor.verified_addresses.eth_addresses.length
    ) {
        await checkEthWallet(body)
    } else if (
        config.gating.sol &&
        !body.validatedData.interactor.verified_addresses.sol_addresses.length
    ) {
        await checkSolWallet(body)
    }

    if (config.gating.maxFid > 0 && body.validatedData.interactor.fid >= config.gating.maxFid) {
        await checkFid(
            body.validatedData.interactor.fid,
            config.gating.minFid,
            config.gating.maxFid
        )
    } else if (config.gating.score > 0) {
        await checkOpenRankScore(
            body.validatedData.interactor.fid,
            body.validatedData.interactor.fid,
            config.gating.score
        )
    } else if (config.gating.channel) {
        //
        await checkChannelMembership(body.validatedData.interactor.fid, config.gating.channel)
    } else if (config.gating.erc20?.address && config.gating.erc20.network) {
        await checkOwnsErc20(
            body.validatedData.interactor.verified_addresses.eth_addresses,
            config.gating.erc20.network,
            config.gating.erc20.address,
            config.gating.erc20.balance
        )
    } else if (
        config.gating.erc1155?.address &&
        config.gating.erc1155.network &&
        config.gating.erc1155.tokenId
    ) {
        await checkOwnsErc1155(
            body.validatedData.interactor.verified_addresses.eth_addresses,
            config.gating.erc1155.network,
            config.gating.erc1155.address,
            config.gating.erc1155.tokenId,
            config.gating.erc1155.balance
        )
    } else if (config.gating.erc721?.address && config.gating.erc721.network) {
        await checkOwnsErc721(
            body.validatedData.interactor.verified_addresses.eth_addresses,
            config.gating.erc721.network,
            config.gating.erc721.address,
            config.gating.erc721.balance
        )
    }
}
