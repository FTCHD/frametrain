'use server'
import { erc20Abi, getContract } from 'viem'
import { chains, chainsByChainId, getClient } from './viem'
import { parseAbi } from 'abitype'

const uniswapAbi = parseAbi([
    'function token0() view returns (address)',
    'function token1() view returns (address)',
])

export const getPoolClient = async (address: `0x${string}`) => {
    for (const chain of chains) {
        const client = getClient(chain)
        const contract = getContract({
            client,
            address,
            abi: uniswapAbi,
        })

        try {
            await contract.read.token0()
            return client
        } catch {
            console.error(`Failed to fetch token0 for ${address} on ${chain}`)
        }
    }

    throw new Error('This pool address is not on any supported chain')
}

async function getTokenData({
    address,
    client,
}: { address: `0x${string}`; client: ReturnType<typeof getClient> }) {
    try {
        const token = getContract({
            client,
            address,
            abi: erc20Abi,
        })

        const name = await token.read.name()
        const symbol = await token.read.symbol()
        const decimals = await token.read.decimals()
        const logo = await getTokenLogo(client.chain.id, address)

        return {
            name,
            symbol,
            decimals,
            address,
            logo,
        }
    } catch (error) {
        console.error(`Failed to fetch token data for ${address}`, error)
    }
    return null
}

async function getTokenLogo(network: number, address: string) {
    const url = `https://api.geckoterminal.com/api/v2/networks/${chainsByChainId[network]}/tokens/${address}`

    const response = await fetch(url)
    const data = (await response.json()) as {
        'data': {
            'id': 'string'
            'type': 'string'
            'attributes': {
                'name': string
                'address': string
                'symbol': string
                'decimals': number
                image_url: string
            }
        }
    }

    return data.data.attributes.image_url
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

    if (!(token0 && token1)) {
        throw new Error('Failed to fetch token data')
    }
    const network = {
        id: client.chain.id,
        name: client.chain.name,
        explorerUrl: client.chain.blockExplorers.default.url,
    }

    return {
        chain: client.chain.name,
        token0,
        token1,
        network,
    }
}
