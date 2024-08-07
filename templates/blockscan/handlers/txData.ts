'use server'
import type { BuildFrameData, FrameValidatedActionPayload } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import {
    type AbiFunction,
    type GetAbiItemParameters,
    encodeFunctionData,
    getAbiItem,
    parseAbi,
} from 'viem'
import type { Config, Storage } from '..'

export default async function txData({
    config,
    params,
    body,
    storage,
}: {
    body: FrameValidatedActionPayload
    config: Config
    storage: Storage
    params: { functionName: string }
}): Promise<BuildFrameData> {
    if (!config.etherscan) {
        throw new FrameError('Smart Contract config is missing')
    }

    const fid = body.validatedData.interactor.fid
    const signatures = storage?.[fid] || []
    const signature = signatures.find((sig) => sig.functionName === params.functionName)

    if (!signature) {
        throw new FrameError(`${params.functionName} not found!`)
    }

    if (!signature.args.length) {
        throw new FrameError(`Missing args for ${params.functionName}`)
    }

    const abiString = config.etherscan.abis.flatMap((abi) => abi)
    const abi = parseAbi(abiString) as AbiFunction[]
    const abiItem = getAbiItem({
        abi,
        name: params.functionName,
        args: signature.args,
    } as GetAbiItemParameters)

    if (!abiItem) throw new FrameError(`Function ${params.functionName} not found on ABI`)

    const data = encodeFunctionData({
        abi,
        args: signature.args,
        functionName: params.functionName,
    })

    return {
        transaction: {
            chainId: `eip155:${config.etherscan.chainId}`,
            method: 'eth_sendTransaction',
            params: {
                abi,
                to: config.etherscan.address,
                value: '0',
                data,
            },
        },
    }
}
