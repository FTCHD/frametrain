'use server'
import type { BuildFrameData, FrameActionPayload, FrameButtonMetadata } from '@/lib/farcaster'
import TextSlide, { type TextSlideProps } from '@/sdk/components/TextSlide'
import { FrameError } from '@/sdk/error'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import { BaseError } from 'viem'
import type { Config, Storage } from '..'
import { chainByChainId } from '../common/constants'
import { getSignature, readContract } from '../common/signature'
import initial from './initial'

export default async function functionHandler({
    body,
    config,
    params,
}: {
    body: FrameActionPayload
    config: Config
    storage?: Storage
    params: { currentIndex?: string; requiresInput?: string }
}): Promise<BuildFrameData> {
    if (!config.etherscan) {
        throw new FrameError('Smart Contract config is missing')
    }

    const fontSet = new Set(['Roboto'])
    const fonts: any[] = []
    const buttons: FrameButtonMetadata[] = [
        {
            label: '←',
        },
    ]

    const buttonIndex = body.untrustedData.buttonIndex
    const textInput = body.untrustedData?.inputText
    const rawAbiString = config.etherscan.abis.flat()
    const signatures = rawAbiString.filter((abi) => abi.startsWith('function'))
    const currentIndex = params.currentIndex === undefined ? 0 : Number(params.currentIndex)
    let signatureIndex = 0

    switch (buttonIndex) {
        case 2: {
            signatureIndex = currentIndex
            break
        }

        default: {
            signatureIndex =
                buttonIndex === 1
                    ? params.currentIndex === undefined
                        ? 0
                        : currentIndex - 1
                    : currentIndex + 1
            break
        }
    }

    if (signatureIndex < 0 || signatureIndex >= signatures.length) {
        return initial({ config })
    }

    const { argStr, args, name: functionName } = getSignature(signatures, signatureIndex, textInput)

    const view: TextSlideProps = {
        ...config.functionSlide,
        title: {
            ...config.functionSlide?.title,
            text: functionName,
        },
        subtitle: {
            ...config.functionSlide?.subtitle,
            text: functionName,
        },
        bottomMessage: {
            ...config.functionSlide?.bottomMessage,
            text: `${signatureIndex + 1}/${signatures.length}`,
        },
    }

    if (view.title?.fontFamily) {
        fontSet.add(view.title.fontFamily)
    }

    if (view.subtitle?.fontFamily) {
        fontSet.add(view.subtitle.fontFamily)
    }

    if (view.bottomMessage?.fontFamily) {
        fontSet.add(view.bottomMessage.fontFamily)
    }

    const chain = chainByChainId[config.etherscan.chainId]
    if (!chain) {
        throw new FrameError('Unsupported chain')
    }

    if (buttonIndex == 2) {
        try {
            view.subtitle.text = await readContract({
                signatures,
                address: config.etherscan.address,
                args,
                functionName,
                chain,
                encode: true,
            })
            args.length = 0
        } catch (e) {
            if (e instanceof BaseError) {
                const message = e.shortMessage.split('\n').pop()

                if (message) {
                    if (message.startsWith('0x') && e.metaMessages)
                        throw new FrameError(e.metaMessages.join('\n'))

                    throw new FrameError(message)
                }

                throw new FrameError(e.message)
            }
            throw new FrameError(
                e instanceof Error
                    ? e.message
                    : e?.toString() || `Unable to read data for: ${functionName}`
            )
        }
    } else {
        if (args.length) {
            buttons.push({ label: 'Confirm' })
            view.subtitle.text = argStr.join('\n')
            view.bottomMessage = {
                ...config.functionSlide?.bottomMessage,
                text: `Enter the values of the arguments separated by commas (${signatureIndex}/${signatures.length})`,
            }
        }
    }

    buttons.push({
        label: '→',
    })

    if (signatureIndex === signatures.length) {
        buttons.push({
            label: 'Create Your Own',
            action: 'link',
            target: 'https://frametra.in',
        })
    }

    for (const font of fontSet) {
        const loadedFont = await loadGoogleFontAllVariants(font)
        fonts.push(...loadedFont)
    }

    return {
        fonts,
        buttons,
        component: TextSlide(view),
        handler: args.length ? 'input' : 'function',
        params: {
            currentIndex: buttonIndex === 2 ? signatureIndex + 1 : signatureIndex,
        },
        inputText: args.length ? 'arguments separated by commas' : undefined,
    }
}
