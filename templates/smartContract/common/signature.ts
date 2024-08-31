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
        const request = await client.simulateContract({
            abi: parseAbi(signatures),
            functionName,
            args,
            address,
        })

        if (typeof request.result !== 'undefined') {
            data = Array.isArray(request.result)
                ? (request.result as unknown[]).join('\n')
                : `${request.result}`
        } else if (encode) {
            data = encodeFunctionData({
                abi: parseAbi(signatures),
                functionName,
                args,
            })
        }
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

    // if (baseArgs.length !== abiItem.inputs.length) {
    //     throw new Error('Input string does not match the number of arguments in the ABI signature')
    // }
    const name = abiItem.name

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

    return { sign, abiItem, name, args, argStr }
}
