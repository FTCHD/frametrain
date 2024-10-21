'use server'
import { getViem } from '@/sdk/viem'
import { parseAbi } from 'abitype'
import { erc20Abi, getContract } from 'viem'
import { uniswapChains } from './format'

interface Pool {
    type: string
    address: string
    api_address: string
    price_in_usd: string
    reserve_in_usd: string
    from_volume_in_usd: string
    to_volume_in_usd: string
    price_percent_change: string
    network: {
        name: string
        image_url: string
        identifier: string
    }
    dex: {
        name: string
        identifier: string
        image_url: string
    }
    tokens: {
        name: string
        symbol: string
        address: string
        image_url: string
        is_base_token: boolean
    }[]
    volume_percent_change_24h: string | null
    pool_creation_date: string
}

interface SearchResponseData {
    id: string
    type: string
    attributes: {
        networks: any[]
        dexes: any[]
        pools: Pool[]
        pairs: any[]
        tags: any[]
    }
}

const uniswapAbi = parseAbi([
    'function token0() view returns (address)',
    'function token1() view returns (address)',
])

export const getPoolClient = async (address: `0x${string}`) => {
    for (const chain of uniswapChains) {
        const client = getViem(chain.key)
        const contract = getContract({
            client,
            address,
            abi: uniswapAbi,
        })

        try {
            await contract.read.token0()
            return client
        } catch (e) {
            console.error(`Failed to fetch token0 for ${address} on ${chain.key}`, e)
        }
    }

    throw new Error('This pool address is not on any supported chain')
}

async function getTokenData({
    address,
    client,
}: { address: `0x${string}`; client: ReturnType<typeof getViem> }) {
    const token = getContract({
        client,
        address,
        abi: erc20Abi,
    })

    const name = await token.read.name()
    const symbol = await token.read.symbol()
    const decimals = await token.read.decimals()
    const logo = 'https://assets.geckoterminal.com/bqu4tzciplldg2ojzx6ww5hd09ii'

    return {
        name,
        symbol,
        decimals,
        address,
        logo,
    }
}

async function getPoolTokenLogos(poolAddress: string): Promise<string[]> {
    //   example https://app.geckoterminal.com/api/p1/search?query=0x00a59c2d0f0f4837028D47a391decbffC1e10608
    const request = await fetch(`https://app.geckoterminal.com/api/p1/search?query=${poolAddress}`)

    const response = await request.json()
    const data = response.data as SearchResponseData

    if (
        data?.type !== 'search' ||
        data.attributes.pools.length !== 1 ||
        data.attributes.pools[0].address.toLowerCase() !== poolAddress
    ) {
        throw new Error('Invalid pool')
    }

    return data.attributes.pools[0].tokens.map((token) => token.image_url)
}

export async function getPoolData(address: `0x${string}`) {
    const client = await getPoolClient(address)
    const pool = getContract({
        client,
        address,
        abi: uniswapAbi,
    })

    const [address0, address1] = await Promise.all([pool.read.token0(), pool.read.token1()])
    const [token0, token1] = await Promise.all([
        getTokenData({ address: address0, client }),
        getTokenData({ address: address1, client }),
    ])

    const [token0Logo, token1Logo] = await getPoolTokenLogos(pool.address.toLowerCase())
    token0.logo = token0Logo
    token1.logo = token1Logo

    const network = {
        id: client.chain.id,
        name: client.chain.name,
        explorerUrl: client.chain.blockExplorers!.default.url,
    }

    return {
        chain: client.chain.name,
        token0,
        token1,
        network,
    }
}
