'use server'
import type { BuildFrameData, FrameActionPayload } from '@/lib/farcaster'
import type { FramePressConfig } from '../Config'
import buildFrame from './frame'

export default async function initial(config: FramePressConfig): Promise<BuildFrameData> {
    const slideConfig = config.slides?.[0]

    return buildFrame(config, slideConfig)
}
