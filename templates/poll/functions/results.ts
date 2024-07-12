'use server'
import type {
    BuildFrameData,
    FrameActionPayload,
    FrameValidatedActionPayload,
} from '@/lib/farcaster'
import type { Config, Storage } from '..'
import initial from './initial'

export default async function results(
    body: FrameActionPayload | FrameValidatedActionPayload,
    config: Config,
    storage: Storage,
    params: any
): Promise<BuildFrameData> {
    return initial(config, storage)
}
