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

        if (typeof request.result !== undefined) {
            data = Array.isArray(request.result)
                ? (request.result as unknown[]).join('\n')
                : `${request.result}`
        } else {
            if (encode) {
                data = encodeFunctionData({
                    abi: parseAbi(signatures),
                    functionName,
                    args,
                })
            }
        }
    } catch (e) {
        if (e instanceof BaseError) {
            const revertError = e.walk((err) => err instanceof ContractFunctionRevertedError)
            if (revertError instanceof ContractFunctionRevertedError) {
                throw new Error(revertError.shortMessage)
            }
        }
        const error = e as Error
        console.error('Error reading contract:', error)
        throw new Error(error.message)
    }

    return data
}

export function getSignature(signatures: string[], index: number, input: string) {
    const sign = signatures[index]

    const baseArgs = input.split(',').map((arg) => arg.trim())
    const abiItem = (parseAbi([sign]) as AbiFunction[])[0]
    const name = abiItem.name

    const args = abiItem.inputs.map((input, i) => {
        let value
        const arg = baseArgs[i]
        switch (input.type) {
            case 'uint256': {
                value = BigInt(arg || 0)
                break
            }
            case 'address': {
                value = arg as `0x${string}`
                break
            }

            case 'bool': {
                value = arg === 'true'
                break
            }

            case 'string': {
                value = arg
                break
            }

            default: {
                value = Number(arg || 0)
                break
            }
        }

        return value
    })

    const argStr = abiItem.inputs.map((arg) => `${arg.name} (${arg.type})`)

    return { sign, abiItem, name, args, argStr }
}
