'use server'
import type { FrameActionPayload } from '@/lib/farcaster'
import type { Config, State } from '..'
import initial from './initial'

export default async function page(
    body: FrameActionPayload,
    config: Config,
    state: State,
    params: any
) {
    const buttonIndex = body.untrustedData.buttonIndex

    let frame

    switch (buttonIndex) {
        case 2: {
            break
        }

        default: {
            frame = await initial(config, state)
            break
        }
    }

    return {
        frame: frame,
        state: state,
    }
}
