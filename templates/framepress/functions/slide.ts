'use server'
import type { BuildFrameData, FrameActionPayload } from '@/lib/farcaster'
import type { FramePressConfig } from '../Config'
import buildFrame from './frame'

export default async function slide(
    body: FrameActionPayload,
    config: FramePressConfig,
    params: any
): Promise<BuildFrameData> {
    const slideConfig = config.slides?.[1] // TODO figure out issue with params

    return buildFrame(config, slideConfig)
}
