import { type ChainKey, getViem } from '@/sdk/viem'
import { type Hex, erc20Abi } from 'viem'

export async function getAddressFromEns(name: string) {
    const client = getViem('mainnet')

    const hex = await client.getEnsAddress({ name })
    if (!hex) {
        throw new Error('Invalid ENS name')
    }

    console.log(`address for ens ${name} is ${hex} on ${client.chain.name}`)

    return hex.toLowerCase() as `0x${string}`
}

export async function getTokenSymbol(address: Hex, chainKey: ChainKey) {
    const client = getViem(chainKey)

    try {
        const symbol = await client.readContract({
            abi: erc20Abi,
            functionName: 'symbol',
            address,
        })
        return symbol
    } catch (error) {
        console.error(`error at getTokenSymbol for address ${address} on ${chainKey}`, error)

        throw new Error('Not an ERC20 token')
    }
}
