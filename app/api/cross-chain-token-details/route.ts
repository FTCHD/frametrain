import { getCrossChainTokenDetails } from '@/templates/airdrop/utils/server_onchainUtils'
import { unstable_cache } from 'next/cache'
import { NextResponse } from 'next/server'
import { isAddress } from 'viem'
import * as z from 'zod'

const getCachedCrossChainTokenDetails = unstable_cache(
    async (chain: Schema['chain'], address: Schema['address'], symbol: Schema['symbol']) => {
        return await getCrossChainTokenDetails(chain, address, symbol)
    },
    ['cross-chain-token-details'],
    { revalidate: 3600 }
)

export const schema = z.object({
    chain: z.enum(['mainnet', 'arbitrum', 'base', 'optimism', 'polygon']),
    address: z.string().refine((value) => isAddress(value), {
        message: 'Invalid Ethereum address',
    }),
    symbol: z.string(),
})

type Schema = z.infer<typeof schema>

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const unParsedChain = searchParams.get('chain')
    const unParsedAddress = searchParams.get('address')
    const unParsedSymbol = searchParams.get('symbol')

    const { success, data } = schema.safeParse({
        chain: unParsedChain,
        address: unParsedAddress,
        symbol: unParsedSymbol,
    })

    if (!success) {
        return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
    }
    const { chain, address, symbol } = data

    try {
        const crossTokenDetails = await getCachedCrossChainTokenDetails(chain, address, symbol)

        if (crossTokenDetails) {
            return NextResponse.json(crossTokenDetails)
        }
        return NextResponse.json({ error: 'No cross-chain token details found' }, { status: 404 })
    } catch (error) {
        console.error('Error fetching cross-chain token details:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
