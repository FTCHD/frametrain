'use server'
import type { BuildFrameData, FrameButtonMetadata, FramePayloadValidated } from '@/lib/farcaster'
import { runGatingChecks } from '@/lib/gating'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import BasicView from '@/sdk/views/BasicView'
import type { Config, Storage } from '..'

export default async function page({
    body,
    config,
    storage,
}: {
    body: FramePayloadValidated
    config: Config
    storage: Storage
    params: any
}): Promise<BuildFrameData> {
    await runGatingChecks(body, config.gating)

    const buttons: FrameButtonMetadata[] = []
    const webhooks: NonNullable<BuildFrameData['webhooks']> = []
    const users = storage.users || []

    const fontSet = new Set(['Roboto'])
    const fonts: any[] = []

    if (config.success.title?.fontFamily) {
        fontSet.add(config.success.title.fontFamily)
    }

    if (config.success.subtitle?.fontFamily) {
        fontSet.add(config.success.subtitle.fontFamily)
    }

    if (config.success.bottomMessage?.fontFamily) {
        fontSet.add(config.success.bottomMessage.fontFamily)
    }

    for (const font of fontSet) {
        const loadedFont = await loadGoogleFontAllVariants(font)
        fonts.push(...loadedFont)
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
            label: 'Create Your Own',
            action: 'link',
            target: 'https://frametra.in',
        })
    }

    if (!users.find((user) => user === body.interactor.fid)) {
        webhooks.push({
            event: 'gated.success',
            data: {
                fid: body.interactor.fid,
                cast_url: `https://warpcast.com/~/conversations/${body.cast.hash}`,
            },
        })
        storage.users = users.concat([body.interactor.fid])
    }

    const buildData: Record<string, unknown> = {
        buttons,
        fonts,
        webhooks,
        storage,
        aspectRatio: '1.91:1',
    }

    if (config.success.image) {
        buildData.image = config.success.image
    } else {
        buildData.component = BasicView(config.success)
    }

    return buildData as unknown as BuildFrameData
}
