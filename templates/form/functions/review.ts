'use server'
import type { BuildFrameData } from '@/lib/farcaster'
import type { Config, State } from '..'
import ReviewView from '../views/Review'
import { UserState } from './userState'

export default async function review(
    config: Config,
    state: State,
    // biome-ignore lint/correctness/noUnusedVariables: <explanation>
    params: any
): Promise<BuildFrameData> {
    // const fid: number = body.untrustedData.fid;
    // const buttonIndex: number = body.untrustedData.buttonIndex;
    // const textInput = body.untrustedData.inputText ?? '';
    // // const currentInput = state.inputFieldNumber + 1;
    // console.log(body);

    return {
        buttons: [
            {
                label: '←',
            },
            {
                label: 'Submit',
            },
        ],
        state,
        aspectRatio: '1.91:1',
        component: ReviewView(config, UserState),
        functionName: 'input',
    }
}
