'use server'
import type { BuildFrameData, FramePayloadValidated } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import type { Config, Storage } from '..'

export default async function success({
    body,
    config,
    storage,
    params,
}: {
    body: FramePayloadValidated
    config: Config
    storage: Storage
    params: any
}): Promise<BuildFrameData> {
    if (!config.successType || config.successType === 'disabled') {
        throw new FrameError('Frame not properly configured')
    }
	
    const tappedButtonIndex = body.tapped_button.index - 1
    const tappedButton = config?.successButtons?.[tappedButtonIndex]

    if (!tappedButton) {
        throw new FrameError('Button not configured')
    }
	
    return {
        frame: tappedButton.target as string,
    }
}