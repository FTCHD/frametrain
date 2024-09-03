import type { AbiFunction, Address } from 'abitype'
import { parseAbi } from 'abitype'
import {
    BaseError,
    type Chain,
    ContractFunctionRevertedError,
    createPublicClient,
    encodeFunctionData,
    http,
} from 'viem'

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
            data = encodeFunctionData({
                abi: parseAbi(signatures),
                functionName,
                args,
            })
        }
        const result = await client.readContract({
            abi: parseAbi(signatures),
            functionName,
            args,
            address,
        })

        data = Array.isArray(result) ? (result as unknown[]).join('\n') : `${result}`
    } catch (e) {
        const error = e as Error

        if (error instanceof BaseError) {
            const revertError = error.walk((err) => err instanceof ContractFunctionRevertedError)
            if (revertError instanceof ContractFunctionRevertedError) {
                console.error('Contract function reverted:', revertError)
                throw new Error(revertError.shortMessage)
            }
            console.error('Base error:', error)
        } else {
            console.error('Unknown error:', error)
        }
        throw new Error(error.message)
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
