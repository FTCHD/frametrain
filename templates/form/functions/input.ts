'use server'
import type { BuildFrameData, FrameActionPayload } from '@/lib/farcaster'
import type { Config, State } from '..'
import InputView from '../views/Input'
import { UserState, updateUserState } from "./userState";
import CoverView from '../views/Cover';
import initial from './initial';
import review from './review';
import about from './about';
import SuccessView from '../views/Success';
import { kv } from '@vercel/kv'

const grayBackgroundBlackText = '\x1b[47m\x1b[30m'; // Gray background, black text
const yellowBackgroundBlackText = '\x1b[43m\x1b[30m';
const reset = '\x1b[0m'; // Reset styles

export default async function input(
    body: FrameActionPayload,
    config: Config,
    state: State,
    params: any
): Promise<BuildFrameData> {
    let _newState = state;
    
    console.log("NEW STATE IS : ", _newState);

    const fid: number = body.untrustedData.fid
    const buttonIndex: number = body.untrustedData.buttonIndex
    const textInput = body.untrustedData.inputText ?? '';
    // let buttons: { label: string }[] = [{ label: 'NOT-SET' }, { label: 'default' }, { label: 'NOT-SET' }]

    // console.log(grayBackgroundBlackText);
    // console.log(UserState);
    // console.log(reset);

    const prevState = structuredClone(UserState)

    switch (prevState.pageType) {
        case 'init':
        case undefined:
            // if pressed button was NEXT show first input and update UserState respectively
            // INDEX == 2 => START THE POLL
            if (buttonIndex == 2) {
                updateUserState({ pageType: 'input' })
                break
            }
            // if pressed button was ABOUT show about view and update the UserState respectively
            // INDEX == 1 => ABOUT THE POLL
            if (buttonIndex == 1) {
                updateUserState({ pageType: 'about' })
                break
            }
            break;
        case 'about':
            if (buttonIndex == 1) {
                updateUserState({ pageType: 'init' })
                break
            }
        // case 'home':
        //     // INDEX == 2 => START THE POLL
        //     if (buttonIndex == 2) {
        //         updateUserState({ pageType: 'input' })
        //         break
        //     }
        //     // if pressed button was ABOUT show about view and update the UserState respectively
        //     // INDEX == 1 => ABOUT THE POLL
        //     if (buttonIndex == 1) {
        //         updateUserState({ pageType: 'about' })
        //         break
        //     }
        //     break;
        case 'input':
            // ADD SUBMITTED INPUT TO STATE
            if (config.fields[UserState.inputFieldNumber].isNecessary == true) {
                if (!(textInput.length > 0)) {
                    updateUserState({ pageType: 'input' })
                    break;
                }
            }
            if (textInput.length > 0) {
                let _inputs = UserState.inputValues;
                _inputs[UserState.inputFieldNumber] = textInput
                updateUserState({ inputValues: _inputs })
            }

            if (prevState.inputFieldNumber + 1 == UserState.totalInputFieldNumber) {
                console.log("TIME TO REVIEWWWWWWWWWWWWWWWWWWWWWWWWWWW");

                // if button pressed was NEXT_PAGE, show the review page
                if (buttonIndex == 2) {
                    updateUserState({ pageType: 'review' })
                    break
                }
            }
            if (prevState.inputFieldNumber == 0) {
                // if button pressed was PREV_PAGE show initial page
                if (buttonIndex == 1) {
                    updateUserState({ pageType: 'init' })
                    break
                }
            }

            if (buttonIndex == 1) {
                updateUserState({ inputFieldNumber: prevState.inputFieldNumber - 1 })
                break
            }
            if (buttonIndex == 2) {
                updateUserState({ inputFieldNumber: prevState.inputFieldNumber + 1 })
                break
            }
            break
        case 'review':
            // if pressed button was submit, show the success page
            if (buttonIndex == 2) {
                updateUserState({ pageType: 'success' })
                break
            }

            // if pressed button was back, go through the form again
            if (buttonIndex == 1) {
                updateUserState({ pageType: 'input', inputFieldNumber: 0 })
                break
            }

        case 'submitted-before':
        // ask if wants to submit a new one
        case 'success':
            updateUserState({ pageType: 'init' })
        default:
            break
    }

    // console.log(yellowBackgroundBlackText);
    // console.log(UserState);
    // console.log(reset);

    switch (UserState.pageType) {
        case 'init':
            return initial(config, _newState)
        case 'about':
            return about(config)
        case 'input':
            return {
                buttons: [
                    {
                        label: '←',
                    },
                    {
                        label: '→',
                    },
                ],
                inputText: 'Enter The Value',
                aspectRatio: '1.91:1',
                state: _newState,
                component: InputView(config, UserState),
                functionName: 'input',
            }
        case 'review':
            return review(config, _newState, null)
        case 'success':
            // console.log(yellowBackgroundBlackText);
            // console.log("DATA TO BE PUSHED: ", { fid, inputValues: UserState.inputValues, timestamp: (new Date()).getTime() });
            // console.log("STATE: ", state);
            // console.log(reset);

            const newState = Object.assign(state, {
                data: [...(state.data || []), { fid, inputValues: UserState.inputValues, timestamp: (new Date()).getTime() }],
            })

            kv.set(config.form_id, newState)
            console.log(yellowBackgroundBlackText);
            console.log("STATE: ", newState);
            console.log(reset);

            return {
                buttons: [
                    {
                        label: 'Back'
                    }
                ],
                state: newState,
                aspectRatio: '1.91:1',
                component: SuccessView(config),
                functionName: 'input',
            }
        default:
            break
    }

    return {
        buttons: [
            {
                label: '←',
            },
        ],
        state,
        aspectRatio: '1.91:1',
        component: InputView(config, UserState),
        functionName: 'initial',
    }
}
