'use server'
import type { BuildFrameData, FramePayloadValidated } from '@/lib/farcaster'
import type { Config } from '..'
import initial from './initial'

export default async function success({
    config,
}: {
    body: FramePayloadValidated
    config: Config
    storage: Storage
    params: any
}): Promise<BuildFrameData> {
    return initial({ config })
}
