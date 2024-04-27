'use server'
import type { FrameActionPayload, FrameValidatedActionPayload } from '@/lib/farcaster'
import type { Config, State } from '..'
import initial from './initial'

export default async function results(
    body: FrameActionPayload | FrameValidatedActionPayload,
    config: Config,
    state: State,
    params: any
) {
    return initial(config, state)
}
