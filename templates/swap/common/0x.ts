import { corsFetch } from '@/sdk/scrape'
import { type Address, type Hex, formatUnits, parseUnits } from 'viem'

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
type ZeroXSwapQuoteResponse = ZeroXSwapQuote | { code: number; reason: string }
// https://0x.org/docs/0x-swap-api/api-references/get-swap-v1-price#response
type ZeroXSwapPrice = Omit<ZeroXSwapQuote, 'orders' | 'guaranteedPrice' | 'to' | 'data'>
type ZeroXSwapPriceResponse = ZeroXSwapPrice | { code: number; reason: string }

const FEE_RECIPIENT = '0xeE15d275dbC6392019FCdE476d4A6f000F76F6A9'
const AFFILIATE_FEE = 0.01

export const ZeroXProxyAddressByChainID: Record<number, Hex> = {
    1: '0xDef1C0ded9bec7F1a1670819833240f027b25EfF',
    10: '0xdef1abe32c034e558cdd535791643c58a13acc10',
    8453: '0xDef1C0ded9bec7F1a1670819833240f027b25EfF',
    42161: '0xDef1C0ded9bec7F1a1670819833240f027b25EfF',
}

const get0xApiBase = (networkId: number) => {
    const CHAIN_ID_0X_API_BASE_MAP: Record<number, string> = {
        1: 'api.0x.org',
        10: 'optimism.api.0x.org',
        8453: 'base.api.0x.org',
        42161: 'arbitrum.api.0x.org',
        137: 'polygon.api.0x.org',
    }

    const baseURL = CHAIN_ID_0X_API_BASE_MAP[networkId]
    return baseURL || null
}

export async function fetchPrice({
    network,
    amount,
    buyToken,
    sellToken,
}: {
    network: { id: number; name: string }
    amount: string
    buyToken: {
        address: Hex
        decimals: number
        symbol: string
    }
    sellToken: {
        address: Hex
        decimals: number
        symbol: string
    }
}) {
    const baseURL = get0xApiBase(network.id)

    if (!baseURL) {
        return null
    }

    if (sellToken.symbol.toLowerCase() === 'weth') {
        sellToken.symbol = 'ETH'
        sellToken.address = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
    } else if (buyToken.symbol.toLowerCase() === 'weth') {
        buyToken.symbol = 'ETH'
        buyToken.address = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
    }

    const url = new URL(`https://${baseURL}/swap/v1/price`)
    url.searchParams.append('sellToken', sellToken.address)
    url.searchParams.append('buyToken', buyToken.address)
    url.searchParams.append('buyAmount', parseUnits(amount, buyToken.decimals).toString())
    url.searchParams.append('feeRecipient', FEE_RECIPIENT)
    url.searchParams.append('buyTokenPercentageFee', AFFILIATE_FEE.toString())
    url.searchParams.append('feeRecipientTradeSurplus', FEE_RECIPIENT)

    const response = await corsFetch(url.toString(), {
        headers: { '0x-api-key': process.env.ZEROX_API_KEY || '' },
    })

    if (!response) return null

    const data = JSON.parse(response) as ZeroXSwapPriceResponse

    if ('code' in data) {
        throw new Error(data.reason)
    }

    const price = formatUnits(BigInt(data.sellAmount), sellToken.decimals)

    return {
        price: +price,
        rate: data.sellTokenToEthRate,
    }
}

export async function fetchQuote({
    network,
    amount,
    buyToken,
    sellToken,
}: {
    network: { id: number; name: string }
    amount: string
    buyToken: {
        address: Hex
        decimals: number
        symbol: string
    }
    sellToken: {
        address: Hex
        decimals: number
        symbol: string
    }
}) {
    const baseURL = get0xApiBase(network.id)

    if (!baseURL) {
        return null
    }

    if (sellToken.symbol.toLowerCase() === 'weth') {
        sellToken.symbol = 'ETH'
        sellToken.address = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
    } else if (buyToken.symbol.toLowerCase() === 'weth') {
        buyToken.symbol = 'ETH'
        buyToken.address = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
    }

    const url = new URL(`https://${baseURL}/swap/v1/quote`)
    url.searchParams.append('sellToken', sellToken.address)
    url.searchParams.append('buyToken', buyToken.address)
    url.searchParams.append('buyAmount', parseUnits(amount, buyToken.decimals).toString())
    url.searchParams.append('feeRecipient', FEE_RECIPIENT)
    url.searchParams.append('buyTokenPercentageFee', AFFILIATE_FEE.toString())
    url.searchParams.append('feeRecipientTradeSurplus', FEE_RECIPIENT)

    const response = await corsFetch(url.toString(), {
        headers: { '0x-api-key': process.env.ZEROX_API_KEY || '' },
    })

    if (!response) return null

    const data = JSON.parse(response) as ZeroXSwapQuoteResponse

    if ('code' in data) {
        throw new Error(data.reason)
    }

    return data
}
