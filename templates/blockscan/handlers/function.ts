'use server'
import type {
    BuildFrameData,
    FrameButtonMetadata,
    FrameValidatedActionPayload,
} from '@/lib/farcaster'
import TextSlide, { type TextSlideProps } from '@/sdk/components/TextSlide'
import { FrameError } from '@/sdk/error'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import { type AbiFunction, parseAbi } from 'abitype'
import {
    http,
    BaseError,
    ContractFunctionRevertedError,
    createPublicClient,
    encodeFunctionData,
} from 'viem'
import type { Config, Storage } from '..'
import { chainByChainId } from '../common/constants'
import initial from './initial'

export default async function functionHandler({
    body,
    config,
    params,
}: {
    body: FrameValidatedActionPayload
    config: Config
    storage: Storage
    params: { currentIndex?: string; isInput?: string }
}): Promise<BuildFrameData> {
    if (!config.etherscan) {
        throw new FrameError('Smart Contract config is missing')
    }

    const roboto = await loadGoogleFontAllVariants('Roboto')
    const fonts = [...roboto]
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
    const isInput = params.isInput === 'true'
    const signature = abiString[signatureIndex]
    const baseArgs = textInput.split(',').map((arg) => arg.trim())
    const abiItem = (parseAbi([signature]) as AbiFunction[])[0]
    const functionName = abiItem.name
    const view: TextSlideProps = {
        title: {
            ...config.functionSlide?.title,
            text: `Function #${signatureIndex + 1} ${functionName}`,
        },
        subtitle: {
            ...config.functionSlide?.subtitle,
            text: signature,
        },
    }

    if (view.title.fontFamily) {
        const titleFont = await loadGoogleFontAllVariants(view.title.fontFamily)
        fonts.push(...titleFont)
    }

    if (view.subtitle.fontFamily) {
        const subtitleFont = await loadGoogleFontAllVariants(view.subtitle.fontFamily)
        fonts.push(...subtitleFont)
    }

    if (view.bottomMessage?.fontFamily) {
        const customFont = await loadGoogleFontAllVariants(view.bottomMessage.fontFamily)
        fonts.push(...customFont)
    }

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
    const chain = chainByChainId[config.etherscan.chainId]

    if (!chain) {
        throw new FrameError('Unsupported chain')
    }

    const client = createPublicClient({
        chain,
        transport: http(),
        batch: { multicall: { wait: 10, batchSize: 1000 } },
    })

    let nextIndex = 0

    console.log('before', {
        buttonIndex,
        nextIndex,
        currentIndex: signatureIndex,
        total: abiString.length,
        args: args.length,
        inputs: abiItem.inputs.length,
        functionName,
        input,
        isInput,
    })

    switch (isInput) {
        case true: {
            switch (buttonIndex) {
                case 2: {
                    const chain = chainByChainId[config.etherscan.chainId]

                    if (!chain) {
                        throw new FrameError('Unsupported chain')
                    }

                    const client = createPublicClient({
                        chain,
                        transport: http(),
                        batch: { multicall: { wait: 10, batchSize: 1000 } },
                    })

                    try {
                        const simulation = await client.simulateContract({
                            abi: parseAbi(rawAbiString),
                            functionName,
                            args,
                            address: config.etherscan.address,
                        })

                        if (typeof simulation.result !== undefined) {
                            view.subtitle.text = Array.isArray(simulation.result)
                                ? (simulation.result as unknown[]).join('\n')
                                : `${simulation.result}`
                            break
                        }
                        view.subtitle.text = encodeFunctionData({
                            abi: parseAbi(rawAbiString),
                            functionName,
                            args,
                        })
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
                    if (buttonIndex === 1) {
                        nextIndex = signatureIndex === 0 ? abiString.length - 1 : signatureIndex - 1
                    } else {
                        nextIndex = signatureIndex === abiString.length - 1 ? 0 : signatureIndex + 1
                    }
                }
            }
            break
        }

        default: {
            if (buttonIndex === 1) {
                if (signatureIndex === abiString.length) {
                    return initial({ config })
                }
                nextIndex = signatureIndex === 0 ? abiString.length - 1 : signatureIndex - 1
            } else {
                nextIndex = signatureIndex === abiString.length - 1 ? 0 : signatureIndex + 1
            }

            if (abiItem.inputs.length) {
                buttons.push({ label: 'Confirm' })
                view.bottomMessage = {
                    ...config.functionSlide?.bottomMessage,
                    text: 'Enter the values of the arguments separated by commas',
                }
                nextIndex = signatureIndex
            } else {
                try {
                    const data = await client.simulateContract({
                        abi: parseAbi(rawAbiString),
                        functionName,
                        address: config.etherscan.address,
                    })

                    if (typeof data.result !== undefined) {
                        view.subtitle.text = Array.isArray(data.result)
                            ? (data.result as unknown[]).join('\n')
                            : `${data.result}`
                    }
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
            }
            break
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
        textInput,
        input,
    })

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
        fonts,
        buttons,
        component: TextSlide(view),
        handler: abiItem.inputs.length ? 'input' : 'function',
        params: {
            currentIndex: nextIndex,
            isInput: abiItem.inputs.length,
        },
        inputText: abiItem.inputs.length ? 'arguments separated by commas' : undefined,
    }
}
