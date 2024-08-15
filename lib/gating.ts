import { getFarcasterUserChannels } from '@/sdk/neynar'
import { http, createPublicClient, parseAbi, getAddress, formatUnits } from 'viem'
import type { Abi, Chain } from 'viem'
import { base, mainnet, optimism, zora, blast, arbitrum, fantom, polygon, bsc } from 'viem/chains'
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
        const response = (await fetch(
            `${neynarApiBaseUrl}/farcaster/user/bulk?fids=${userFid}&viewer_fids=${viewerFid}`,
            {
                method: 'GET',
                headers: {
                    accept: 'application/json',
                    api_key: `${process.env.NEYNAR_API_KEY}`,
                    'content-type': 'application/json',
                },
            }
        )
            .then((response) => response.json())
            .catch((err) => {
                console.error(err)
                return {
                    isValid: false,
                    message: undefined,
                }
            })) as { users: FarcasterUserInfo[] }

        return response.users[0].viewer_context!
    } catch {
        return {
            'following': false,
            'followed_by': false,
        }
    }
}
