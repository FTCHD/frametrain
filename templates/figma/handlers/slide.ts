'use server'
import type { BuildFrameData, FramePayloadValidated } from '@/lib/farcaster'
import type { FramePressConfig } from '../Config'
import buildFigmaFrame from '../utils/FigmaFrameBuilder'

export default async function click({
    body,
    config,
    params,
}: {
    body: FramePayloadValidated
    config: FramePressConfig
    params: { slideId: string }
}): Promise<BuildFrameData> {
    const slideId = params.slideId
    const slideConfig = config.slides?.find((slide) => slide.id === slideId)

    return buildFigmaFrame(config, slideConfig)
}
