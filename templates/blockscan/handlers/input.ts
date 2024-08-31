'use server'
import type {
    BuildFrameData,
    FrameButtonMetadata,
    FrameValidatedActionPayload,
} from '@/lib/farcaster'
import TextSlide, { type TextSlideProps } from '@/sdk/components/TextSlide'
import { FrameError } from '@/sdk/error'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, Storage } from '..'
import { chainByChainId } from '../common/constants'
import { getSignature, readContract } from '../common/signature'
import initial from './initial'

export default async function functionHandler({
    body,
    config,
    params,
}: {
    body: FrameValidatedActionPayload
    config: Config
    storage?: Storage
    params: { currentIndex?: string; requiresInput?: string }
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

    const buttonIndex = body.validatedData.tapped_button.index as number
    const textInput = body.validatedData?.input?.text as string | undefined
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

    const { argStr, args, ...signature } = getSignature(signatures, signatureIndex, textInput)

    const functionName = signature.name

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

    // Load additional fonts if specified in the view configuration
    const loadAdditionalFonts = async (fontFamily?: string) => {
        if (fontFamily) {
            const additionalFonts = await loadGoogleFontAllVariants(fontFamily)
            fonts.push(...additionalFonts)
        }
    }

    // Load additional fonts specified in the view configuration
    await Promise.all(
        [view.title.fontFamily, view.subtitle.fontFamily, view.bottomMessage?.fontFamily]
            .filter(Boolean)
            .map(loadAdditionalFonts)
    )

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
            const error = e as Error
            throw new FrameError(error.message)
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
