'use server'
import type { BuildFrameData, FrameValidatedActionPayload } from '@/lib/farcaster'
import type { Config, Storage } from '..'
import { FrameError } from '@/sdk/error'
import { parseAbi, type AbiFunction } from 'abitype'
import FunctionView from '../views/Function'

export default async function signature({
    body,
    config,
    params,
}: {
    body: FrameValidatedActionPayload
    config: Config
    storage: Storage
    params: { currentIndex?: string; action?: 'read' | 'write' }
}): Promise<BuildFrameData> {
    if (!config.etherscan) {
        throw new FrameError('Smart Contract config is missing')
    }
    const rawAbiString = config.etherscan.abis.flatMap((abi) => abi)
    const abiString = rawAbiString.filter((abi) => abi.startsWith('function'))
    const signatureIndex = params.currentIndex === undefined ? 0 : Number(params.currentIndex)
    const signature = abiString[signatureIndex]

    const abi = parseAbi([signature]) as AbiFunction[]
    const abiObj = abi[0]
    const args = abiObj.inputs.map((input) => `${input.name} (${input.type})`)

    return {
        buttons: [
            {
                label: '←',
            },
            {
                label: 'Confirm',
            },
            {
                label: '→',
            },
        ],
        component: FunctionView({
            signature,
            index: signatureIndex + 1,
            args,
            total: abiString.length,
        }),
        handler: 'simulate',
        params: {
            currentIndex: signatureIndex,
        },
        inputText: args.length ? 'arguments separated by commas' : undefined,
    }
}
