'use server'
import type { BuildFrameData, FramePayloadValidated } from '@/lib/farcaster'
import type { Config } from '..'
import initial from './initial'

export default async function more({
    body,
    config,
    storage,
}: {
    body: FramePayloadValidated
    config: Config
    storage: undefined
}): Promise<BuildFrameData> {
    return initial({ config, storage })
}
