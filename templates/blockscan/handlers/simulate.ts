'use server'
import type { BuildFrameData, FrameActionPayload, FrameButtonMetadata } from '@/lib/farcaster'
import type { Config } from '..'
import PageView from '../views/Page'
import { FrameError } from '@/sdk/error'
import { parseAbi, type AbiFunction } from 'abitype'

export default async function simulate({
    body,
    config,
    storage,
    params,
}: {
    body: FrameActionPayload
    config: Config
    storage: Storage
    params: { functionIndex?: string }
}): Promise<BuildFrameData> {
    if (!config.etherscan) {
        throw new FrameError('Smart Contract config is missing')
    }
    const buttons: FrameButtonMetadata[] = []
    const abiString = config.etherscan.abis.flatMap((abi) => abi)
    const functionIndex = params.functionIndex === undefined ? 0 : Number(params.functionIndex)
    const currentFunction = abiString[functionIndex]

    const abi = parseAbi([currentFunction]) as AbiFunction[]
    const inputs = abi.map(({ inputs }) => inputs.flatMap((input) => input))
    const outputs = abi.map(({ outputs }) => outputs.flatMap((output) => output))
    console.log({ inputs, outputs, total: abiString.length })

    const isLastFunction = functionIndex === abiString.length
    const nextIndex = functionIndex + 1

    if (isLastFunction) {
        buttons.push(
            {
                label: 'Start Over',
            },
            {
                label: 'Create Your Own Frame',
                action: 'link',
                target: 'https://frametra.in',
            }
        )
    } else {
        buttons.push({
            label: 'Simulate',
        })
    }

    return {
        buttons,
        component: PageView({ function: currentFunction, args: [] }),
        handler: functionIndex === abiString.length ? 'page' : 'simulate',
        params: {
            functionIndex: nextIndex,
        },
    }
}
