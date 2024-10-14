import { getContractDetails } from '@/templates/airdrop/utils/server_onchainUtils'
import { unstable_cache } from 'next/cache'
import { NextResponse } from 'next/server'
import { isAddress } from 'viem'
import * as z from 'zod'

export const schema = z.object({
    chain: z.enum(['mainnet', 'arbitrum', 'base', 'optimism', 'polygon']),
    address: z.string().refine((value) => isAddress(value), {
        message: 'Invalid Ethereum address',
    }),
})

type Schema = z.infer<typeof schema>

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const unParsedChain = searchParams.get('chain')
    const unParsedAddress = searchParams.get('address')

    const { success, data } = schema.safeParse({
        chain: unParsedChain,
        address: unParsedAddress,
    })

    if (!success) {
        return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
    }
    const { chain, address } = data
    try {
        const crossTokenDetails = await unstable_cache(
            async () => getContractDetails(chain, address),
            [chain, address],
            {
                //Never revalidate since the token contract details never changes
                revalidate: false,
                tags: ['contract-details'],
            }
        )()

        if (crossTokenDetails) {
            return NextResponse.json(crossTokenDetails)
        }
        return NextResponse.json({ error: 'No cross-chain token details found' }, { status: 404 })
    } catch (error) {
        console.error('Error fetching cross-chain token details:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
