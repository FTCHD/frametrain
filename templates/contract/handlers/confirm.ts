'use server'
import type { BuildFrameData, FrameActionPayload, FrameButtonMetadata } from '@/lib/farcaster'
import TextSlide, { type TextSlideProps } from '@/sdk/components/TextSlide'
import { FrameError } from '@/sdk/error'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import { BaseError } from 'viem'
import type { Config, Storage } from '..'
import { chainByChainId } from '../common/constants'
import { getSignature, readContract } from '../common/signature'
import signatureHandler from './signature'

export default async function confirm({
    body,
    config,
    params,
}: {
    body: FrameActionPayload
    config: Config
    storage?: Storage
    params: { currentIndex?: string; navigation?: 'true' }
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
    let signatureIndex = currentIndex

    const {
        argStr,
        args,
        name: functionName,
        ...signature
    } = getSignature(signatures, signatureIndex, textInput)

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

    if (params.navigation !== 'true' && buttonIndex == 2) {
        try {
            view.subtitle.text = await readContract({
                signatures,
                address: config.etherscan.address,
                args,
                functionName,
                chain,
                encode: signature.state === 'write',
            })
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
        signatureIndex = buttonIndex === 1 ? currentIndex - 1 : currentIndex + 1
        return signatureHandler({
            config,
            params: { currentIndex: signatureIndex.toString() },
        })
    }

    const nextIndex = signatureIndex + 1

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

        buttons: [
            {
                label: '←',
            },
            {
                label: '→',
            },
        ],
        component: TextSlide(view),
        handler: 'confirm',
        params: {
            currentIndex: nextIndex,
            navigation: true,
        },
    }
}