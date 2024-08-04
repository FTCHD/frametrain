'use server'

import type { FrameValidatedActionPayload, BuildFrameData } from '@/lib/farcaster'
import type { Config, Storage } from '..'
import { FrameError } from '@/sdk/error'
import { parseAbi, type AbiFunction, getAbiItem, type GetAbiItemParameters } from 'viem'
import SuccessView from '../views/Success'

export default async function success({
    params,
    config,
    storage,
    body,
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
    const functionName = params.functionName

    const signatures = storage?.[fid] || []
    const signature = signatures.find((sig) => sig.functionName === functionName)

    if (!signature) {
        throw new FrameError(`Missing args for ${functionName}`)
    }

    const rawAbiString = config.etherscan.abis.flatMap((abi) => abi)
    const abi = parseAbi(rawAbiString) as AbiFunction[]
    const abiItem = getAbiItem({
        abi: abi,
        name: functionName,
        args: signature.args,
    } as GetAbiItemParameters)

    if (!abiItem) throw new FrameError(`Function ${functionName} not found on ABI`)

    return {
        buttons: [
            {
                label: '→',
            },
            {
                label: '←',
            },
        ],
        component: SuccessView({ name: functionName }),
        handler: 'function',
    }
}
