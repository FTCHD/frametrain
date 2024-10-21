'use server'
import type { BuildFrameData, FramePayloadValidated } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import type { Config, Storage } from '..'

export default async function cover({
    body,
    config,
    storage,
    params,
}: {
    body: FramePayloadValidated | undefined
    config: Config
    storage: Storage
    params: any
}): Promise<BuildFrameData> {
    const firstSlide = config?.slides?.[0]

    if (!firstSlide) {
        throw new FrameError('No slides in the form')
    }

    return {
        buttons: firstSlide.buttons.map((button) =>
            button.type === 'link'
                ? {
                      label: button.text,
                      action: 'link',
                      target: button.target,
                  }
                : {
                      label: button.text,
                  }
        ),
        aspectRatio: firstSlide.aspectRatio,
        image: firstSlide.imageUrl,
        handler: 'slide',
        params: {
            currentSlide: 0,
        },
    }
}
