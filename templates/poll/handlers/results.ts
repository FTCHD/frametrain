'use server'
import type { BuildFrameData } from '@/lib/farcaster'
import type { Config } from '..'
import initial from './initial'

export default async function results({
    config,
}: {
    config: Config
}): Promise<BuildFrameData> {
    return initial({ config })
}
