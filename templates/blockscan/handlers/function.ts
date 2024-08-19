'use server'
import type {
    BuildFrameData,
    FrameButtonMetadata,
    FrameValidatedActionPayload,
} from '@/lib/farcaster'
import type { Config, Storage } from '..'
import { FrameError } from '@/sdk/error'
import { parseAbi, type AbiFunction } from 'abitype'
import TextSlide from '@/sdk/components/TextSlide'
import { getViemClient } from '../utils/viem'
import { BaseError, ContractFunctionRevertedError } from 'viem'

export default async function functionHandler({
    body,
    config,
    params,
}: {
    body: FrameValidatedActionPayload
    config: Config
    storage: Storage
    params: { currentIndex?: string; action?: 'read' | 'write'; needsInput?: string }
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
    const rawAbiString = config.etherscan.abis.flatMap((abi) => abi)
    const abiString = rawAbiString.filter((abi) => abi.startsWith('function'))
    const signatureIndex = params.currentIndex === undefined ? 0 : Number(params.currentIndex)
    const signature = abiString[signatureIndex]
    const baseArgs = textInput.split(',').map((arg) => arg.trim())
    let action: 'read' | 'write' = 'read'
    let subtitle = signature

    const abiItem = (parseAbi([signature]) as AbiFunction[])[0]
    const functionName = abiItem.name
    const needsInput = params.needsInput === 'true'
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
    const client = getViemClient(config.etherscan.chainId)

    try {
        const simulation = await client.simulateContract({
            abi: parseAbi(rawAbiString),
            functionName,
            args,
            address: config.etherscan.address,
        })
        if (typeof simulation.result !== undefined) {
            subtitle = Array.isArray(simulation.result)
                ? (simulation.result as unknown[]).join('\n')
                : `${simulation.result}`
            console.log({ subtitle })
        } else {
            action = 'write'
        }
    } catch (e) {
        if (buttonIndex === 2 && needsInput) {
            if (e instanceof BaseError) {
                const revertError = e.walk((err) => err instanceof ContractFunctionRevertedError)
                if (revertError instanceof ContractFunctionRevertedError) {
                    throw new FrameError(revertError.shortMessage)
                }
            }
            const error = e as Error
            throw new FrameError(error.message)
        }
    }

    if (buttonIndex === 2) {
        if (params.action) {
            //
        }
    }

    switch (buttonIndex) {
        case 2: {
            try {
                //
                console.log
            } catch (e) {
                if (e instanceof BaseError) {
                    const revertError = e.walk(
                        (err) => err instanceof ContractFunctionRevertedError
                    )
                    if (revertError instanceof ContractFunctionRevertedError) {
                        throw new FrameError(revertError.shortMessage)
                    }
                }
                const error = e as Error
                throw new FrameError(error.message)
            }
            break
        }
        default: {
            let nextIndex = 1
            if (buttonIndex === 1) {
                nextIndex = signatureIndex === 0 ? abiString.length - 1 : signatureIndex - 1
            } else {
                nextIndex = signatureIndex === abiString.length - 1 ? 0 : signatureIndex + 1
            }
        }
    }

    if (abiItem.inputs.length) {
        buttons.push({
            label: 'Confirm',
        })
    }

    buttons.push({
        label: '→',
    })

    if (signatureIndex === abiString.length) {
        buttons.push({
            label: 'Create Your Own Frame',
            action: 'link',
            target: 'https://frametra.in',
        })
    }

    return {
        buttons,
        component: TextSlide({
            title: functionName,
            titleStyles: config.functionStyles?.titleStyles,
            subtitle,
            subtitleStyles: config.functionStyles?.subtitleStyles,
            ...(abiItem.inputs.length
                ? {
                      customMessage: 'Enter the values of the arguments separated by commas',
                      customStyles: config.functionStyles?.customStyles,
                  }
                : {}),
        }),
        handler: 'function',
        params: {
            currentIndex: signatureIndex + 1,
            action,
            needsInput: !!abiItem.inputs.length,
        },
        inputText: abiItem.inputs.length ? 'arguments separated by commas' : undefined,
    }
}
