'use server'

import { getContract } from 'viem'
import { chains, getClient } from './viem'
import { ERC20_ABI, UNI_V3_POOL_ABI } from './abis'

export const getPoolClient = async (address: `0x${string}`) => {
    for (const chain of chains) {
        const client = getClient(chain)
        const contract = getContract({
            client,
            address,
            abi: UNI_V3_POOL_ABI,
        })

        try {
            await contract.read.slot0()
            return client
        } catch {}
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
            abi: ERC20_ABI,
        })

        const name = await token.read.name()
        const symbol = await token.read.symbol()
        const decimals = await token.read.decimals()

        return {
            name,
            symbol,
            decimals,
            address,
        }
    } catch (error) {
        console.error(error)
    }
    return null
}

export async function getPoolData(address: `0x${string}`) {
    const client = await getPoolClient(address)
    const pool = getContract({
        client,
        address,
        abi: UNI_V3_POOL_ABI,
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
    }

    return {
        chain: client.chain.name,
        token0,
        token1,
        network,
    }
}
