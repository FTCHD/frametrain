'use server'
import type { BuildFrameData, FrameActionPayload } from '@/lib/farcaster'
import type { Config, State } from '..'
import AboutView from '../views/About'

export default async function about(
    config: Config,
    state?: State,
    params?: any
): Promise<BuildFrameData> {
    // const fid: number = body.untrustedData.fid;
    // const buttonIndex: number = body.untrustedData.buttonIndex;
    // const textInput = body.untrustedData.inputText ?? '';
    // const currentInput = state.inputFieldNumber + 1;

    return {
        buttons: [
            {
                label: '←',
            },
        ],
        aspectRatio: '1.91:1',
        component: AboutView(config),
        functionName: 'input',
    }
}
