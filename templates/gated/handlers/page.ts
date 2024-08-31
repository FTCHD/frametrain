'use server'
import type {
    BuildFrameData,
    FrameButtonMetadata,
    FrameValidatedActionPayload,
} from '@/lib/farcaster'
import { validateGatingOptions } from '@/lib/gating'
import { FrameError } from '@/sdk/error'
import type { Config } from '..'
import TextSlide from '@/sdk/components/TextSlide'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'

export default async function page({
    body,
    config,
}: {
    body: FrameValidatedActionPayload
    config: Config
    storage: Storage
    params: any
}): Promise<BuildFrameData> {
    const viewer = body.validatedData.interactor
    const cast = body.validatedData.cast
    const buttons: FrameButtonMetadata[] = []

    if (!config.owner) {
        throw new FrameError('Frame Owner not configured')
    }

    const validated = await validateGatingOptions({
        user: config.owner,
        option: config.requirements,
        cast: cast.viewer_context,
        viewer,
    })

    if (validated !== null) {
        throw new FrameError(validated.message)
    }

    const roboto = await loadGoogleFontAllVariants('Roboto')
    const fonts = [...roboto]

    if (config.success.title.fontFamily) {
        const titleFont = await loadGoogleFontAllVariants(config.success.title.fontFamily)
        fonts.push(...titleFont)
    }

    if (config.success.subtitle.fontFamily) {
        const subtitleFont = await loadGoogleFontAllVariants(config.success.subtitle.fontFamily)
        fonts.push(...subtitleFont)
    }

    if (config.success.bottomMessage?.fontFamily) {
        const customFont = await loadGoogleFontAllVariants(config.success.bottomMessage.fontFamily)
        fonts.push(...customFont)
    }

    if (config.links.length) {
        config.links.forEach((link, i) => {
            buttons.push({
                label: `Reward #${i + 1}`,
                action: 'link',
                target: link,
            })
        })
    } else {
        buttons.push({
            label: 'Create Your Own Frame',
            action: 'link',
            target: 'https://frametra.in',
        })
    }

    const buildData: Record<string, unknown> = {
        buttons,
        fonts,
    }

    if (config.success.image) {
        buildData.image = config.success.image
    } else {
        buildData.component = TextSlide(config.success)
    }

    return buildData as unknown as BuildFrameData
}
