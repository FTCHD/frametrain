'use server'
import type { BuildFrameData } from '@/lib/farcaster'
import type { FramePayloadValidated } from '@/lib/validate'
import type { FramePressConfig } from '../Config'
import buildFigmaFrame from '../utils/FigmaFrameBuilder'

export default async function click({
    body,
    config,
    params,
}: {
    body: FramePayloadValidated
    config: FramePressConfig
    params: any
}): Promise<BuildFrameData> {
    const slideId = params.origin
    const buttonIndex = body.buttonIndex.toString()
    const slideConfig = config.slides?.find((slide) => slide.id === slideId)
    const buttonConfig = slideConfig?.buttons.find((button) => button.id === buttonIndex)
    const targetSlideConfig = config.slides?.find((slide) => slide.id === buttonConfig?.target)

    return buildFigmaFrame(config, targetSlideConfig)
}
