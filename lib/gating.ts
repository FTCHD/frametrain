import type { GatingOptionsProps } from '@/sdk/components/GatingOptions'
import { getFarcasterUserChannels } from '@/sdk/neynar'
import { http, createPublicClient, formatUnits, getAddress, parseAbi } from 'viem'
import type { Abi, Chain } from 'viem'
import { arbitrum, base, blast, bsc, fantom, mainnet, optimism, polygon, zora } from 'viem/chains'
import type { FarcasterUserInfo } from './farcaster'

const neynarApiBaseUrl = 'https://api.neynar.com/v2'

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
        throw new Error('Unsupported chain')
    }

    return createPublicClient({
        chain,
        transport: http(),
        batch: { multicall: { wait: 10, batchSize: 1000 } },
    })
}

type BaseTokenParams = {
    addresses: string[]
    chain: string
    contractAddress: string
    minAmount?: number
}

type Erc20TokenParams = BaseTokenParams &
    (
        | {
              erc: '721'
              tokenId?: string
          }
        | { erc: '20' }
        | {
              erc: '1155'
              tokenId: string
          }
    )

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

export async function checkErcTokenOwnership(args: Erc20TokenParams) {
    const { addresses, chain, contractAddress, ...rest } = args
    const client = getViemClient(chain)
    const abis: Record<string, Abi> = {
        '20': ERC20_ABI,
        '721': ERC721_ABI,
        '1155': ERC1155_ABI,
    }

    const abi = abis[rest.erc]
    if (!abi) {
        throw new Error('Invalid ERC type')
    }

    const address = getAddress(contractAddress)
    const name = (await client.readContract({
        abi,
        address,
        functionName: 'name',
    })) as string

    const decimals = (await client
        .readContract({
            abi,
            address,
            functionName: 'decimals',
        })
        .catch(() => 1)) as number

    const balances: number[] = []

    if (rest.minAmount) {
        for (const ownerAddress of addresses) {
            const owner = getAddress(ownerAddress)
            const args = (rest.erc === '1155' ? [owner, rest.tokenId] : [owner]) as
                | [`0x${string}`, bigint]
                | [`0x${string}`]
            try {
                const balanceOf = (await client.readContract({
                    abi,
                    address,
                    functionName: 'balanceOf',
                    args,
                })) as bigint
                const balance = formatUnits(balanceOf, decimals)
                balances.push(Number(balance) >= rest.minAmount ? Number(balance) : 1)
            } catch {}
        }
    }

    const isHolding = balances.some((bal) => bal > 0)

    return { isHolding, name }
}

export async function checkOpenRankScore(viewerFid: number, userFid: number, score: number) {
    const url = `https://graph.cast.k3l.io/scores/personalized/engagement/fids?k=${score}&limit=1000&lite=true`
    const options = {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify([userFid]),
    }

    try {
        const response = await fetch(url, options)
        const data = (await response.json()) as {
            result: { fid: number; score: number }[]
        }

        return data.result.some((item) => item.fid === viewerFid)
    } catch {
        return false
    }
}

export async function checkFarcasterChannelsMembership(fid: number, channels: string[]) {
    const userChannels = await getFarcasterUserChannels(fid)
    const channelsToJoin = channels
        .filter((channel) => !userChannels.map((c) => c.id).includes(channel))
        .map((channel) => `/${channel}`)

    return channelsToJoin
}

export async function checkFollowStatus(userFid: number, viewerFid: number) {
    try {
        const request = await fetch(
            `${neynarApiBaseUrl}/farcaster/user/bulk?fids=${userFid}&viewer_fid=${viewerFid}`,
            {
                method: 'GET',
                headers: {
                    accept: 'application/json',
                    api_key: `${process.env.NEYNAR_API_KEY}`,
                    'content-type': 'application/json',
                },
            }
        )
        const response = await request.json()

        return response.users[0].viewer_context
    } catch {
        return {
            'following': false,
            'followed_by': false,
        }
    }
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
export async function validateGatingOptions({
    user,
    cast,
    viewer,
    option,
}: {
    viewer: FarcasterUserInfo
    cast: { liked: boolean; recasted: boolean }
    user: { fid: number; username: string }
    option: GatingOptionsProps['config']
}): Promise<{ message: string } | null> {
    let message = 'Must'
    let errorType: { message: string; type: string; target?: string } | null = null
    let withSuffix = true

    try {
        //
        if (option.recasted && !cast.recasted) {
            errorType = { message: 'recast', type: 'ctx' }
        } else if (option.liked && !cast.liked) {
            errorType = { message: 'like', type: 'ctx' }
        } else if (option.following || option.followedBy) {
            const status = await checkFollowStatus(user.fid, viewer.fid)
            if (option.following && !status.following) {
                errorType = { message: `follow @${user.username}`, type: 'follow' }
            } else if (option.followedBy && !status.followed_by) {
                errorType = { message: `be followed by @${user.username}`, type: 'follow' }
            }
        } else if (option.powerBadge && !viewer.power_badge) {
            errorType = { message: 'power badge user', type: 'be' }
        } else if (option.eth && !viewer.verified_addresses.eth_addresses.length) {
            errorType = { message: 'an ethereum', type: 'wallets' }
        } else if (option.sol && !viewer.verified_addresses.sol_addresses.length) {
            errorType = { message: 'a solana', type: 'wallets' }
        }

        if (option.maxFid > 0 && viewer.fid >= option.maxFid) {
            errorType = { message: `an FID less than ${option.maxFid}`, type: 'have' }
        } else if (option.score > 0) {
            const containsUserFID = await checkOpenRankScore(viewer.fid, user.fid, option.score)

            if (!containsUserFID) {
                errorType = {
                    message: `an Open Rank score closer to that of @${user.username}`,
                    type: 'have',
                }
            }
        } else if (option.channels.checked && option.channels.data.length) {
            const channels = await checkFarcasterChannelsMembership(
                viewer.fid,
                option.channels.data
            )

            if (channels.length) {
                errorType = { message: `joined "${channels.join(', ')}" channels`, type: 'have' }
            }
        } else if (option.erc20?.address && option.erc20.network) {
            //
            try {
                const tokenInfo = await checkErcTokenOwnership({
                    addresses: viewer.verified_addresses.eth_addresses,
                    chain: option.erc20.network,
                    contractAddress: option.erc20.address,
                    erc: '20',
                    minAmount: option.erc20.balance,
                })

                if (!tokenInfo.isHolding) {
                    if (!option.erc20.balance) {
                        errorType = { message: tokenInfo.name, type: 'erc' }
                    } else {
                        errorType = {
                            message: `${option.erc20.balance} ${tokenInfo.name}`,
                            type: 'erc',
                        }
                    }
                }
            } catch {
                errorType = { message: 'ERC-20 token', type: 'erc' }
            }
        } else if (option.erc1155?.address && option.erc1155.network && option.erc1155.tokenId) {
            //
            try {
                const tokenInfo = await checkErcTokenOwnership({
                    addresses: viewer.verified_addresses.eth_addresses,
                    chain: option.erc1155.network,
                    contractAddress: option.erc1155.address,
                    erc: '1155',
                    tokenId: option.erc1155.tokenId,
                    minAmount: option.erc1155.balance,
                })

                if (!tokenInfo.isHolding) {
                    if (!option.erc1155.balance) {
                        errorType = { message: tokenInfo.name, type: 'erc' }
                    } else {
                        errorType = {
                            message: `${option.erc1155.balance} ${tokenInfo.name}`,
                            target: option.erc1155.collection,
                            type: 'erc',
                        }
                    }
                }
            } catch {
                errorType = { message: 'ERC-1155 token', type: 'erc' }
            }
        } else if (option.erc721?.address && option.erc721.network) {
            //
            try {
                const tokenInfo = await checkErcTokenOwnership({
                    addresses: viewer.verified_addresses.eth_addresses,
                    chain: option.erc721.network,
                    contractAddress: option.erc721.address,
                    erc: '721',
                    minAmount: option.erc721.balance,
                })

                if (!tokenInfo.isHolding) {
                    if (!option.erc721.balance) {
                        errorType = { message: tokenInfo.name, type: 'erc' }
                    } else {
                        errorType = {
                            message: `${option.erc721.balance} ${tokenInfo.name}`,
                            target: option.erc721.collection,
                            type: 'erc',
                        }
                    }
                }
            } catch {
                errorType = { message: 'an ERC-721', type: 'erc' }
            }
        }
    } catch (e) {
        const err = e as Error
        errorType = { message: err.message, type: 'error' }
    }

    if (!errorType) return null

    switch (errorType.type) {
        case 'ctx': {
            message += `${message} this frame`
            break
        }

        case 'wallets': {
            message += `have ${message} wallet connected`
            break
        }

        case 'have': {
            message += `have ${message}`
            break
        }

        case 'erc': {
            message = `${message} holders only`
            withSuffix = false
            break
        }

        case 'error': {
            message = `Failed to check validate requirements: ${message}`
            withSuffix = false
            break
        }

        default: {
            message += `${message}`
            break
        }
    }

    message = `${message} ${withSuffix ? ' to reveal' : ''}`

    return { message }
}
