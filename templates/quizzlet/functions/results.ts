'use server'
import type {
    BuildFrameData,
    FrameActionPayload,
    FrameButtonMetadata,
    FrameValidatedActionPayload,
} from '@/lib/farcaster'
import type { Config, State } from '..'
import initial from './initial'

export default async function results(
    body: FrameActionPayload | FrameValidatedActionPayload,
    config: Config,
    state: State,
    params: any
): Promise<BuildFrameData> {
    const nextPage =
        params?.currentPage !== undefined
            ? body.untrustedData.buttonIndex === 1
                ? Number(params?.currentPage) - 1
                : Number(params?.currentPage) + 1
            : 1
    const tweetCount = config.tweets.length
    const buttons: FrameButtonMetadata[] = [
        {
            label: '←',
        },
    ]

    if (nextPage < tweetCount) {
        buttons.push({
            label: '→',
        })
    }

    if (body.untrustedData.buttonIndex === 2 && nextPage === tweetCount) {
        buttons.push({
            label: 'Create Your Own',
            action: 'link',
            target: 'https://frametra.in',
        })
    }

    if (body.untrustedData.buttonIndex === 1 && nextPage === 0) {
        return initial(config, state)
    }

    return initial(config, state)
}
