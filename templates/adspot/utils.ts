import { type ChainKey, getViem } from '@/sdk/viem'
import { type Hex, erc20Abi } from 'viem'

import Dayjs from 'dayjs'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import utc from 'dayjs/plugin/utc'

Dayjs.extend(localizedFormat)
Dayjs.extend(utc)
Dayjs.extend(advancedFormat)

export function shortenHash(hash: string) {
    return hash.slice(0, 10) + '...' + hash.slice(-10)
}

export function formatDate(date: Date) {
    return Dayjs(date).format('dddd, MMMM D @ LT')
}

export function formatSymbol(amount: string | number, symbol: string) {
    const regex = /(USDT|USDC|DAI)/
    if (regex.test(symbol)) {
        return `$${amount}`
    }

    return `${amount} ${symbol}`
}

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

export async function fetchUser(fid: number) {
    try {
        const request = await fetch(`https://client.warpcast.com/v2/user-by-fid?fid=${fid}`)

        const response = (await request.json()) as {
            'result': {
                'user': {
                    'fid': number
                    'username': string
                    'displayName': string
                    'pfp': {
                        'url': string
                        'verified': boolean
                    }
                }
            }
        }
        return response.result.user
    } catch (e) {
        console.error('fetchUser', e)
        throw e
    }
}
