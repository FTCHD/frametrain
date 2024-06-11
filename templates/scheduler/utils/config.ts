import { createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { baseSepolia } from 'viem/chains'

const privateKey = process.env.NEXT_PUBLIC_KEY
if (!privateKey) {
    throw new Error('Private key is not defined')
}


const account = privateKeyToAccount(
 privateKey as `0x${string}`
)

export const client = createWalletClient({
    account,
    chain: baseSepolia,
    transport: http(),
})
