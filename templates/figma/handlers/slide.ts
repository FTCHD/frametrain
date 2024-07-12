'use server'
import type { BuildFrameData, FrameActionPayload } from '@/lib/farcaster'
import type { FramePressConfig } from '../config'
import buildFrame from '../utils/build'

export default async function slide({
    body,
    config,
    params,
}: {
    body: FrameActionPayload
    config: FramePressConfig
    params: any
}): Promise<BuildFrameData> {
    const slideId = params.origin
    const buttonIndex = body.untrustedData.buttonIndex.toString()
    const slideConfig = config.slides?.find((slide) => slide.id === slideId)
    const buttonConfig = slideConfig?.buttons.find((button) => button.id === buttonIndex)
    const targetSlideConfig = config.slides?.find((slide) => slide.id === buttonConfig?.target)

    return buildFrame(config, targetSlideConfig)
}
