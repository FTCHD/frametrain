'use server'
import type { BuildFrameData } from '@/lib/farcaster'
import type { FramePressConfig } from '../Config'
import buildFigmaFrame from '../utils/FigmaFrameBuilder'

export default async function initial({
    config,
}: { config: FramePressConfig }): Promise<BuildFrameData> {
    const slideConfig = config.slides?.[0]

    return buildFigmaFrame(config, slideConfig)
}
