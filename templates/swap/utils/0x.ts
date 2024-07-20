import { corsFetch } from '@/sdk/scrape'
import type { Address, Hex } from 'viem'

// https://0x.org/docs/0x-swap-api/api-references/get-swap-v1-quote#response
type ZeroXSwapQuote = {
    chainId: number
    price: string
    grossPrice: string
    estimatedPriceImpact: string
    value: string
    gasPrice: string
    gas: string
    estimatedGas: string
    protocolFee: string
    minimumProtocolFee: string
    buyTokenAddress: string
    buyAmount: string
    grossBuyAmount: string
    sellTokenAddress: string
    sellAmount: string
    grossSellAmount: string
    sources: Array<{
        name: string
        proportion: string
    }>
    allowanceTarget: string
    sellTokenToEthRate: string
    buyTokenToEthRate: string
    to: Address
    from: Address
    data: Hex
    decodedUniqueId: Hex
    guaranteedPrice: string
    orders: any[]
    fees: {
        zeroExFee: null
    }
    auxiliaryChainData: {
        l1GasEstimate: number
    }
}
// https://0x.org/docs/0x-swap-api/api-references/get-swap-v1-price#response
type ZeroXSwapPrice = Omit<ZeroXSwapQuote, 'orders' | 'guaranteedPrice' | 'to' | 'data'>

const get0xApiBase = (networkId: number) => {
    const CHAIN_ID_0X_API_BASE_MAP: Record<number, string> = {
        1: 'api.0x.org',
        10: 'optimism.api.0x.org',
        8453: 'base.api.0x.org',
        42161: 'arbitrum.api.0x.org',
    }

    const baseURL = CHAIN_ID_0X_API_BASE_MAP[networkId]
    return baseURL || null
}

export async function fetchPrice({
    address0,
    address1,
    network,
}: {
    address0: `0x${string}`
    address1: `0x${string}`
    network: { id: number; name: string }
}) {
    const baseURL = get0xApiBase(network.id)

    if (!baseURL) {
        console.error(`Swaps are not supported on ${network.name}`)
        return null
    }

    const url = new URL(`https://${baseURL}/swap/v1/price`)
    url.searchParams.append('sellToken', address0)
    url.searchParams.append('buyToken', address1)
    url.searchParams.append('sellAmount', '1000000000000000000')
    url.searchParams.append('feeRecipient', '0xeE15d275dbC6392019FCdE476d4A6f000F76F6A9')
    url.searchParams.append('buyTokenPercentageFee', '0.03')

    const response = await corsFetch(url.toString(), {
        headers: { '0x-api-key': process.env.ZEROX_API_KEY || '' },
    })

    if (!response) return null

    const data = JSON.parse(response) as ZeroXSwapPrice

    console.log(
        `Price for ${address0} -> ${address1} is ${Number(data.buyTokenToEthRate).toFixed(7)}`,
        data
    )

    return +data.buyTokenToEthRate
}

export async function fetchQuote({
    address0,
    address1,
    network,
    amount,
}: {
    address0: `0x${string}`
    address1: `0x${string}`
    network: { id: number; name: string }
    amount: string
}) {
    const baseURL = get0xApiBase(network.id)

    if (!baseURL) {
        console.error(`Swaps are not supported on ${network.name}`)
        return null
    }

    const url = new URL(`https://${baseURL}/swap/v1/quote`)
    url.searchParams.append('sellToken', address0)
    url.searchParams.append('buyToken', address1)
    url.searchParams.append('buyAmount', amount)
    url.searchParams.append('feeRecipient', '0xeE15d275dbC6392019FCdE476d4A6f000F76F6A9')
    url.searchParams.append('buyTokenPercentageFee', '0.03')

    const response = await corsFetch(url.toString(), {
        headers: { '0x-api-key': process.env.ZEROX_API_KEY || '' },
    })

    if (!response) return null

    const data = JSON.parse(response) as ZeroXSwapQuote

    console.log(`Quote for ${address0} -> ${address1} is ${Number(data.price).toFixed(6)}`, data)

    return data
}
