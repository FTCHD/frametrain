import { corsFetch } from '@/sdk/scrape'

const get0xApiBase = (networkId: number) => {
    const CHAIN_ID_0X_API_BASE_MAP: Record<number, string> = {
        1: 'api.0x.org',
        56: 'bsc.api.0x.org',
        137: 'polygon.api.0x.org',
        10: 'optimism.api.0x.org',
        8453: 'base.api.0x.org',
        43114: 'avalanche.api.0x.org',
        42161: 'arbitrum.api.0x.org',
        11155111: 'sepolia.api.0x.org',
        42220: 'celo.api.0x.org',
    }

    const baseURL = CHAIN_ID_0X_API_BASE_MAP[networkId]
    return baseURL || null
}

export async function fetchPrice({
    address0,
    address1,
    network,
}: { address0: `0x${string}`; address1: `0x${string}`; network: { id: number; name: string } }) {
    const baseURL = get0xApiBase(network.id)

    if (!baseURL) {
        console.error(`Swaps are not supported on ${network.name}`)
        return null
    }

    const url = new URL(`https://${baseURL}/swap/v1/price`)
    url.searchParams.append('sellToken', address0)
    url.searchParams.append('buyToken', address1)
    url.searchParams.append('sellAmount', '1000000000000000000')

    const response = await corsFetch(url.toString(), {
        headers: { '0x-api-key': process.env.ZEROX_API_KEY || '' },
    })

    if (!response) return null

    const data = JSON.parse(response)

    console.log(`Price for ${address0} -> ${address1} is ${Number(data.price).toFixed(6)}`, data)

    return data.price as string
}
