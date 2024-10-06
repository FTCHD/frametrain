import { BuildFrameData } from "./farcaster"

export type ClientProtocol = 'lens' | 'xmtp' | 'anonymous' | 'farcaster'

export interface OpenFrameMetadata {
    version: string
    accepts: Record<ClientProtocol, string>
    image: string
    buttons?: OpenFrameButton[]
    postUrl?: string
    inputText?: string
    imageAspectRatio?: '1.91:1' | '1:1'
    imageAlt?: string
    state?: string
}

export interface OpenFrameButton {
    label: string
    action?: 'post' | 'post_redirect' | 'link' | 'mint' | 'tx'
    target?: string
    postUrl?: string
}


export function buildOpenFrameMetadata(buildFrameData: BuildFrameData): OpenFrameMetadata {
    return {
        version: 'vNext',
        accepts: {
            farcaster: 'vNext',
            lens: '1.0.0',
            xmtp: 'vNext',
            anonymous: '1.0.0',
        },
        image: buildFrameData.image,
        buttons: buildFrameData.buttons?.map((button) => ({
            label: button.label,
            action: button.action as 'post' | 'post_redirect' | 'link' | 'mint' | 'tx',
            target: button.target,
        })),
        postUrl: buildFrameData.postUrl,
        inputText: buildFrameData.inputText,
        imageAspectRatio: buildFrameData.aspectRatio,
        state: buildFrameData.state,
    };
}