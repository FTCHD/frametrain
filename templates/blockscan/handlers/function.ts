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
import { BaseError, ContractFunctionRevertedError, encodeFunctionData } from 'viem'
import initial from './initial'

export default async function functionHandler({
    body,
    config,
    params,
}: {
    body: FrameValidatedActionPayload
    config: Config
    storage: Storage
    params: { currentIndex?: string }
}): Promise<BuildFrameData> {
    if (!config.etherscan) {
        throw new FrameError('Smart Contract config is missing')
    }
    const buttons: FrameButtonMetadata[] = [
        {
            label: '←',
        },
    ]

    const input = body.validatedData?.input as { text: string } | undefined
    const buttonIndex = body.validatedData.tapped_button.index as number
    const textInput = (input?.text || '') as string
    const rawAbiString = config.etherscan.abis.flat()
    const abiString = rawAbiString.filter((abi) => abi.startsWith('function'))
    const signatureIndex = params.currentIndex === undefined ? 0 : Number(params.currentIndex)
    const signature = abiString[signatureIndex]
    const baseArgs = textInput.split(',').map((arg) => arg.trim())
    let subtitle = signature

    const abiItem = (parseAbi([signature]) as AbiFunction[])[0]
    const functionName = abiItem.name
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
    let nextIndex = 1

    console.log('before', {
        buttonIndex,
        nextIndex,
        currentIndex: signatureIndex,
        total: abiString.length,
        args: args.length,
        inputs: abiItem.inputs.length,
        functionName,
        subtitle,
        textInput,
        input,
    })
    switch (buttonIndex) {
        case 1: {
            if (
                // (params.currentIndex === undefined && params.action) ||
                signatureIndex === abiString.length
            ) {
                return initial({ config })
            }
            nextIndex =
                params.currentIndex === undefined
                    ? signatureIndex + 1
                    : signatureIndex === 0
                      ? abiString.length - 1
                      : signatureIndex - 1
            break
        }

        default: {
            if (buttonIndex === 3 || (buttonIndex === 2 && !abiItem.inputs.length)) {
                nextIndex = signatureIndex === abiString.length - 1 ? 0 : signatureIndex + 1
                break
            }
            nextIndex = signatureIndex + 1
        }
    }

    if (!args.length) {
        nextIndex = signatureIndex
    } else {
        try {
            const data = await client.simulateContract({
                abi: parseAbi(rawAbiString),
                functionName,
                args,
                address: config.etherscan.address,
            })
            if (typeof data.result !== undefined) {
                subtitle = Array.isArray(data.result)
                    ? (data.result as unknown[]).join('\n')
                    : `${data.result}`
                console.log({ subtitle })
            } else {
                console.log({ data })
                subtitle = encodeFunctionData({
                    abi: parseAbi(rawAbiString),
                    functionName,
                    args,
                })
            }
        } catch (e) {
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

    console.log('after', {
        buttonIndex,
        nextIndex,
        currentIndex: signatureIndex,
        total: abiString.length,
        args: args.length,
        inputs: abiItem.inputs.length,
        functionName,
        subtitle,
        textInput,
        input,
    })

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
            currentIndex: nextIndex,
        },
        inputText: abiItem.inputs.length ? 'arguments separated by commas' : undefined,
    }
}
