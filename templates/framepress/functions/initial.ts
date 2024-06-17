'use server'
import type { BuildFrameData } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, State } from '..'
import FigmaView from '../views/FigmaView'
import type { FramePressConfig } from '../Config'
import { getFigmaDesign } from '../utils/FigmaApi'
import Message from '../views/Message'
import buildFrame from './frame'

export default async function initial(config: FramePressConfig): Promise<BuildFrameData> {
    const slideConfig = config.slides?.[0]

    return buildFrame(config, slideConfig)
}
