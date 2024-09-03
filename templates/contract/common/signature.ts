import type { AbiFunction, Address } from 'abitype'
import { parseAbi } from 'abitype'
import { http, BaseError, type Chain, createPublicClient, encodeFunctionData } from 'viem'

export async function readContract({
    chain,
    signatures,
    address,
    args,
    functionName,
    encode = false,
}: {
    chain: Chain
    signatures: string[]
    address: Address
    args?: unknown[]
    functionName: string
    encode?: boolean
}) {
    const client = createPublicClient({
        chain,
        transport: http(),
        batch: { multicall: { wait: 10, batchSize: 1000 } },
    })
    let data = ''

    try {
        if (encode) {
            const result = encodeFunctionData({
                abi: parseAbi(signatures),
                functionName,
                args,
            })
            data = typeof result === 'string' ? result : `${result}`
        } else {
            const result = await client.readContract({
                abi: parseAbi(signatures),
                functionName,
                args,
                address,
            })
            data = Array.isArray(result) ? (result as unknown[]).join('\n') : `${result}`
        }
    } catch (e) {
        if (e instanceof BaseError) {
            const message = e.shortMessage.split('\n').pop()

            if (message) {
                if (message.startsWith('0x') && e.metaMessages)
                    throw new Error(e.metaMessages.join('\n'))

                throw new Error(message)
            }

            throw new Error(e.message)
        }
        throw new Error(
            e instanceof Error
                ? e.message
                : e?.toString() || `Unable to read data for: ${functionName}`
        )
    }

    return data
}

export function getSignature(signatures: string[], index: number, input?: string) {
    const sign = signatures[index]

    const abiItem = (parseAbi([sign]) as AbiFunction[])[0]
    const baseArgs = input ? input.split(',').map((arg) => arg.trim()) : []
    abiItem.stateMutability
    // if (baseArgs.length !== abiItem.inputs.length) {
    //     throw new Error('Input string does not match the number of arguments in the ABI signature')
    // }
    const args = abiItem.inputs.map((input, i) => {
        const arg = baseArgs[i]
        const typeMap: { [key: string]: () => any } = {
            'uint256': () => BigInt(arg || 0),
            'address': () => arg as `0x${string}`,
            'bool': () => arg === 'true',
            'string': () => arg,
            'default': () => Number(arg || 0),
        }
        const value = (typeMap[input.type] || typeMap['default'])()

        return value
    })

    const argStr = abiItem.inputs.map((arg) => `${arg.name} (${arg.type})`)

    const name = abiItem.name
    const state = ['pure', 'view'].includes(abiItem.stateMutability) ? 'read' : 'write'

    return { sign, abiItem, name, args, argStr, state }
}
