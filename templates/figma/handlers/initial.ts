'use server'
import type { BuildFrameData } from '@/lib/farcaster'
import type { FramePressConfig } from '../config'
import buildFrame from '../utils/build'

export default async function initial({
    config,
}: { config: FramePressConfig }): Promise<BuildFrameData> {
    const slideConfig = config.slides?.[0]

    return buildFrame(config, slideConfig)
}
