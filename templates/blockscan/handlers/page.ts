'use server'
import type { BuildFrameData, FrameActionPayload } from '@/lib/farcaster'
import type { Config } from '..'
import initial from './initial'

export default async function page({
    config,
}: {
    body: FrameActionPayload
    config: Config
    storage: Storage
    params: any
}): Promise<BuildFrameData> {
    return initial({ config })
}
