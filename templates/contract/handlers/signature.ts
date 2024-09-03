'use server'
import type { BuildFrameData, FrameButtonMetadata } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import TextView, { type TextViewProps } from '@/sdk/views/TextView'
import type { Config } from '..'
import { getSignature } from '../common/signature'
import initial from './initial'

export default async function signature({
    config,
    params,
}: {
    config: Config
    storage?: undefined
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

    const fontSet = new Set(['Roboto'])
    const fonts: any[] = []
    const rawAbiString = config.etherscan.abis.flat()
    const signatures = rawAbiString.filter((abi) => abi.startsWith('function'))
    const currentIndex = params.currentIndex === undefined ? 0 : Number(params.currentIndex)
    const signatureIndex = currentIndex > signatures.length ? 0 : currentIndex

    if (signatureIndex < 0) {
        return initial({ config })
    }
    const { args, name: functionName, sign } = getSignature(signatures, signatureIndex)

    const view: TextViewProps = {
        ...config.functionSlide,
        title: {
            ...config.functionSlide?.title,
            text: functionName,
        },
        subtitle: {
            ...config.functionSlide?.subtitle,
            text: sign,
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
                label: 'Confirm',
            },
            {
                label: '→',
            },
        ],
        component: TextView(view),
        handler: 'confirm',
        params: {
            currentIndex: signatureIndex,
        },
        inputText: args.length ? 'arguments separated by commas' : undefined,
    }
}
