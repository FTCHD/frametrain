'use server'
import type {
    BuildFrameData,
    FrameButtonMetadata,
    FrameValidatedActionPayload,
} from '@/lib/farcaster'
import type { Config } from '..'
import PageView from '../views/Page'
import { FrameError } from '@/sdk/error'
import { parseAbi, type AbiFunction } from 'abitype'
import { getViemClient } from '../utils/viem'
import functionHandler from './function'

export default async function simulate({
    body,
    config,
    params,
    storage,
}: {
    body: FrameValidatedActionPayload
    config: Config
    storage: Storage
    params: { currentIndex: string; previousIndex: string }
}): Promise<BuildFrameData> {
    if (!config.etherscan) {
        throw new FrameError('Smart Contract config is missing')
    }
    const buttons: FrameButtonMetadata[] = [
        {
            label: '←',
        },
    ]
    const buttonIndex = body.validatedData.tapped_button.index as number
    const textInput = (body.validatedData?.input?.text || '') as string
    const abiString = config.etherscan.abis.flatMap((abi) => abi)
    const signatureIndex = Number(params.currentIndex)
    const signature = abiString[signatureIndex]
    const baseArgs = textInput.split(',').map((arg) => arg.trim())
    let action: 'read' | 'write' = 'read'

    const abi = parseAbi([signature]) as AbiFunction[]
    const abiObj = abi[0]
    const args = abiObj.inputs.map((input, i) => {
        let value
        const arg = baseArgs[i]
        switch (input.type) {
            case 'uint256': {
                value = BigInt(arg)
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
                value = Number(arg)
                break
            }
        }

        return value
    })

    console.log(`simulate handler >> signatureIndex: ${signatureIndex}`, {
        textInput,
        total: abiString.length,
        signatureIndex,
        params,
        abi,
        baseArgs,
        args,
    })
    let result: string | null = null
    const isLastFunction = signatureIndex === abiString.length

    switch (buttonIndex) {
        case 2: {
            const client = getViemClient(config.etherscan.chainId)
            try {
                const simulation = await client.simulateContract({
                    abi,
                    functionName: abi[0].name,
                    args,
                    address: config.etherscan.address,
                })
                console.log('smulate >> simulation', { simulation })
                if (simulation.result) {
                    result = `${simulation.result}`
                } else {
                    action = 'write'
                }
            } catch (e) {
                const error = e as Error
                throw new FrameError(error.message)
            }
            break
        }
        default: {
            let nextIndex = 1
            // nextIndex = buttonIndex === 1 ? Number(params.currentIndex) : signatureIndex + 1
            if (buttonIndex === 1) {
                nextIndex = signatureIndex === 0 ? abiString.length - 1 : signatureIndex - 1
            } else {
                nextIndex = signatureIndex === abiString.length - 1 ? 0 : signatureIndex + 1
            }
            return functionHandler({
                config,
                body,
                storage,
                params: { currentIndex: nextIndex.toString() },
            })
        }
    }
    const nextIndex = signatureIndex + 1

    console.log(`simulate >> signatureIndex: ${signatureIndex}`, {
        params,
        buttonIndex,

        nextIndex,
    })

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
            label: '→',
        })
    }

    return {
        buttons,
        component: PageView({
            result,
            name: abiObj.name,
            index: nextIndex,
            total: abiString.length,
        }),
        handler: signatureIndex === abiString.length ? 'page' : 'function',
        params: {
            currentIndex: nextIndex,
            action,
        },
    }
}
