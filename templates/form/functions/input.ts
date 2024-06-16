'use server'
import type { BuildFrameData, FrameActionPayload } from '@/lib/farcaster'
import type { Config, State } from '..'
import InputView from '../views/Input'
import { UsersState, removeFidFromUserState, updateUserState } from './userState'
import initial from './initial'
import review from './review'
import about from './about'
import SuccessView from '../views/Success'
import SubmittedView from '../views/Submitted'
import { FrameError } from '@/sdk/handlers'

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
export default async function input(
    body: FrameActionPayload,
    config: Config,
    state: State,
    // biome-ignore lint/correctness/noUnusedVariables: <explanation>
    params: any
): Promise<BuildFrameData> {
    let newState = state

    const fid: number = body.untrustedData.fid
    const buttonIndex: number = body.untrustedData.buttonIndex
    const textInput = body.untrustedData.inputText ?? ''
    if (!UsersState[fid]) {
        updateUserState(fid, { pageType: 'init', inputValues: [] })
    }

    const prevUserState = structuredClone(UsersState[fid])

    console.log("BEFORE SWITCH THE STATE IS : ", state);
    console.log("BEFORE SWITCH THE USER STATE IS : ", UsersState);

    switch (prevUserState.pageType) {
        case 'init':
        case undefined:
            // IF "ABOUT" BUTTON WAS PRESSED
            // biome-ignore lint/style/useSingleCaseStatement: <explanation>
            if (buttonIndex == 1) {
                updateUserState(fid, { pageType: 'about' })
                break
            }

            // CHECK IF THE USER HAS SUBMITTED THE FORM BEFORE
            if (config.allowDuplicates == false) {
                const index = getIndexForFid(fid, newState)
                if (index >= 0) {
                    updateUserState(fid, {
                        pageType: 'submitted_before',
                        inputValues: newState.data[index].inputValues,
                        inputFieldNumber: 0,
                        totalInputFieldNumber: config.fields.length,
                        isOldUser: true,
                    })
                    break
                }
            }
            // IF "START" BUTTON WAS PRESSED
            if (buttonIndex == 2) {
                updateUserState(fid, {
                    inputFieldNumber: 0,
                    totalInputFieldNumber: config.fields.length,
                })
                updateUserState(fid, { pageType: 'input' })
                break
            }
            break
        case 'about':
            // Back Button Pressed
            // biome-ignore lint/style/useSingleCaseStatement: <explanation>
            if (buttonIndex == 1) {
                updateUserState(fid, { pageType: 'init' })
                break
            }
            break
        case 'input':
            //CHECK IF THE VALUE ENTERED IS VALID FOR THE TYPE
            // biome-ignore lint/style/useSingleCaseStatement: <explanation>
            if (!isValid(textInput, config.fields[UsersState[fid].inputFieldNumber].fieldType)) {
                // IF INVALID BREAK AND SHOW THE INVALID VALUE MESSAGE
                updateUserState(fid, { pageType: 'input', isFieldValid: false })
                break
                // biome-ignore lint/style/noUselessElse: <explanation>
            } else {
                // IF VALID CONTINUE WITH THE REST OF THE CHECKS
                updateUserState(fid, { isFieldValid: true })
            }
            // ADD SUBMITTED INPUT TO STATE
            // CHECK IF THE INPUT IS A "REQUIRED" ONE
            if (config.fields[UsersState[fid].inputFieldNumber].required == true) {
                if (
                    // biome-ignore lint/complexity/useSimplifiedLogicExpression: <explanation>
                    !(textInput.trim().length > 0) &&
                    !UsersState[fid].inputValues[UsersState[fid].inputFieldNumber]
                ) {
                    updateUserState(fid, { pageType: 'input' })
                    throw new FrameError('You Cannot Leave A Required Field Empty!')
                }
            }
            if (textInput.length > 0) {
                // biome-ignore lint/style/useConst: <explanation>
                let _inputs = UsersState[fid].inputValues
                _inputs[UsersState[fid].inputFieldNumber] = textInput
                updateUserState(fid, { inputValues: _inputs })
            }

            if (prevUserState.inputFieldNumber + 1 == UsersState[fid].totalInputFieldNumber) {
                // if button pressed was NEXT_PAGE, show the review page
                if (buttonIndex == 2) {
                    updateUserState(fid, { pageType: 'review' })
                    break
                }
            }
            // IF ON FIRST INPUT FIELD
            if (prevUserState.inputFieldNumber == 0) {
                // if button pressed was PREV_PAGE show initial page
                if (buttonIndex == 1) {
                    updateUserState(fid, { pageType: 'init' })
                    break
                }
            }

            if (buttonIndex == 1) {
                updateUserState(fid, { inputFieldNumber: prevUserState.inputFieldNumber - 1 })
                break
            }
            if (buttonIndex == 2) {
                updateUserState(fid, { inputFieldNumber: prevUserState.inputFieldNumber + 1 })
                break
            }
            break
        case 'review':
            // if pressed button was submit, show the success page
            // biome-ignore lint/style/useSingleCaseStatement: <explanation>
            if (buttonIndex == 2) {
                updateUserState(fid, { pageType: 'success' })
                break
            }

            // if pressed button was back, go through the form again
            if (buttonIndex == 1) {
                updateUserState(fid, { pageType: 'input', inputFieldNumber: 0 })
                break
            }

        case 'submitted_before':
            // ask if wants to submit a new one or not
            // IF BACK WAS PRESSED
            // biome-ignore lint/style/useSingleCaseStatement: <explanation>
            if (buttonIndex == 1) {
                updateUserState(fid, { pageType: 'init' })
                break
            }

            // IF CONTINUE WAS PRESSED
            if (buttonIndex == 2) {
                updateUserState(fid, { pageType: 'input', inputFieldNumber: 0 })
                break
            }

        case 'success':
            // biome-ignore lint/style/useSingleCaseStatement: <explanation>
            removeFidFromUserState(fid)
            updateUserState(fid, { pageType: 'init', inputValues: [] })
            break;
        default:
            break
    }

    console.log('\x1b[33m%s\x1b[0m', UsersState);


    switch (UsersState[fid].pageType) {
        case 'init':
            return initial(config, newState)
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
                state: newState,
                component: InputView(config, UsersState[fid], {
                    isFieldValid: UsersState[fid].isFieldValid,
                }),
                functionName: 'input',
            }
        case 'review':
            return review(config, newState, fid, null)
        case 'success':
            // CHECK IF USER HAS ALREADY SUBMITTED
            // biome-ignore lint/style/useSingleCaseStatement: <explanation>
            if (config.allowDuplicates == false) {
                if (UsersState[fid].isOldUser) {
                    const index = getIndexForFid(fid, newState)
                    newState.data = [
                        ...newState.data.slice(0, index),
                        ...newState.data.slice(index + 1),
                    ]
                }
            }
            newState = Object.assign(newState, {
                data: [
                    ...(newState.data || []),
                    {
                        fid,
                        inputValues: UsersState[fid].inputValues,
                        timestamp: new Date().getTime(),
                    },
                ],
            })
            return {
                buttons: [
                    {
                        label: 'Back',
                    },
                ],
                state: newState,
                component: SuccessView(config),
                functionName: 'input',
            }
        case 'submitted_before':
            return {
                buttons: [
                    {
                        label: 'Back',
                    },
                    {
                        label: 'Continue',
                    },
                ],
                state: newState,
                component: SubmittedView(config),
                functionName: 'input',
            }
        default:
            break
    }

    console.log('\x1b[36m%s\x1b[0m', 'WAS NOT CAUGHT BY ANYTHING');

    return {
        buttons: [
            {
                label: '←',
            },
        ],
        state,
        component: InputView(config, UsersState[fid]),
        functionName: 'initial',
    }
}

function getIndexForFid(fid: number | string, state: State): number {
    let index: number = -1
    state.data?.find((record, i) => {
        if (record.fid === fid) {
            index = i
        }
    })
    return index
}

function isValid(value: any, varType: 'text' | 'number' | 'email' | 'phone' | 'address'): boolean {
    if (value.trim().length == 0) {
        return true
    }
    switch (varType) {
        case 'text':
            return typeof value === 'string' && value.trim().length > 0

        case 'number':
            // biome-ignore lint/complexity/useSimplifiedLogicExpression: <explanation>
            return !isNaN(value) && !isNaN(Number.parseFloat(value))

        case 'email':
            // biome-ignore lint/style/useSingleCaseStatement: <explanation>
            // biome-ignore lint/correctness/noSwitchDeclarations: <explanation>
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            return typeof value === 'string' && emailRegex.test(value)

        case 'phone':
            // biome-ignore lint/style/useSingleCaseStatement: <explanation>
            // biome-ignore lint/correctness/noSwitchDeclarations: <explanation>
            const phoneRegex = /^\+?[1-9]\d{1,14}$/
            return typeof value === 'string' && phoneRegex.test(value)

        case 'address':
            return typeof value === 'string' && value.trim().length > 0

        default:
            return false
    }
}
