'use server'
import type { BuildFrameData, FrameActionPayload } from '@/lib/farcaster'
import type { Config, State } from '..'
import InputView from '../views/Input'
import { UserState, resetUserState, updateUserState } from './userState'
import initial from './initial'
import review from './review'
import about from './about'
import SuccessView from '../views/Success'
import SubmittedView from '../views/Submitted'

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
export default async function input(
    body: FrameActionPayload,
    config: Config,
    state: State,
    // biome-ignore lint/correctness/noUnusedVariables: <explanation>
    params: any
): Promise<BuildFrameData> {
    let _newState = state

    const fid: number = body.untrustedData.fid
    const buttonIndex: number = body.untrustedData.buttonIndex
    const textInput = body.untrustedData.inputText ?? ''

    const prevUserState = structuredClone(UserState)

    switch (prevUserState.pageType) {
        case 'init':
        case undefined:
            // IF "ABOUT" BUTTON WAS PRESSED
            // biome-ignore lint/style/useSingleCaseStatement: <explanation>
            if (buttonIndex == 1) {
                updateUserState({ pageType: 'about' })
                break
            }

            // CHECK IF THE USER HAS SUBMITTED THE FORM BEFORE
            if (config.allowDuplicates == false){
                const index = getIndexForFid(fid, _newState)
                if (index >= 0) {
                    updateUserState({
                        pageType: 'submitted_before',
                        inputValues: _newState.data[index].inputValues,
                        inputFieldNumber: 0,
                        totalInputFieldNumber: config.fields.length,
                        isOldUser: true,
                    })
                    break
                }
            }
            // IF "START" BUTTON WAS PRESSED
            if (buttonIndex == 2) {
                updateUserState({
                    inputFieldNumber: 0,
                    totalInputFieldNumber: config.fields.length,
                })
                updateUserState({ pageType: 'input' })
                break
            }
            break
        case 'about':
            // Back Button Pressed
            // biome-ignore lint/style/useSingleCaseStatement: <explanation>
            if (buttonIndex == 1) {
                updateUserState({ pageType: 'init' })
                break
            }
            break
        case 'input':
            //CHECK IF THE VALUE ENTERED IS VALID FOR THE TYPE
            // biome-ignore lint/style/useSingleCaseStatement: <explanation>
            if (!isValid(textInput, config.fields[UserState.inputFieldNumber].fieldType)) {
                // IF INVALID BREAK AND SHOW THE INVALID VALUE MESSAGE
                updateUserState({ pageType: 'input', isFieldValid: false })
                break
                // biome-ignore lint/style/noUselessElse: <explanation>
            } else {
                // IF VALID CONTINUE WITH THE REST OF THE CHECKS
                updateUserState({ isFieldValid: true })
            }
            // ADD SUBMITTED INPUT TO STATE
            // CHECK IF THE INPUT IS A "REQUIRED" ONE
            if (config.fields[UserState.inputFieldNumber].required == true) {
                if (
                    // biome-ignore lint/complexity/useSimplifiedLogicExpression: <explanation>
                    !(textInput.trim().length > 0) &&
                    !UserState.inputValues[UserState.inputFieldNumber]
                ) {
                    updateUserState({ pageType: 'input' })
                    break
                }
            }
            if (textInput.length > 0) {
                // biome-ignore lint/style/useConst: <explanation>
                let _inputs = UserState.inputValues
                _inputs[UserState.inputFieldNumber] = textInput
                updateUserState({ inputValues: _inputs })
            }

            if (prevUserState.inputFieldNumber + 1 == UserState.totalInputFieldNumber) {
                // if button pressed was NEXT_PAGE, show the review page
                if (buttonIndex == 2) {
                    updateUserState({ pageType: 'review' })
                    break
                }
            }
            // IF ON FIRST INPUT FIELD
            if (prevUserState.inputFieldNumber == 0) {
                // if button pressed was PREV_PAGE show initial page
                if (buttonIndex == 1) {
                    updateUserState({ pageType: 'init' })
                    break
                }
            }

            if (buttonIndex == 1) {
                updateUserState({ inputFieldNumber: prevUserState.inputFieldNumber - 1 })
                break
            }
            if (buttonIndex == 2) {
                updateUserState({ inputFieldNumber: prevUserState.inputFieldNumber + 1 })
                break
            }
            break
        case 'review':
            // if pressed button was submit, show the success page
            // biome-ignore lint/style/useSingleCaseStatement: <explanation>
            if (buttonIndex == 2) {
                updateUserState({ pageType: 'success' })
                break
            }

            // if pressed button was back, go through the form again
            if (buttonIndex == 1) {
                updateUserState({ pageType: 'input', inputFieldNumber: 0 })
                break
            }

        case 'submitted_before':
            // ask if wants to submit a new one or not
            // IF BACK WAS PRESSED
            // biome-ignore lint/style/useSingleCaseStatement: <explanation>
            if (buttonIndex == 1) {
                updateUserState({ pageType: 'init' })
                break
            }

            // IF CONTINUE WAS PRESSED
            if (buttonIndex == 2) {
                updateUserState({ pageType: 'input', inputFieldNumber: 0 })
                break
            }

        case 'success':
            updateUserState({ pageType: 'init' })
        default:
            break
    }

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
                component: InputView(config, UserState, { isFieldValid: UserState.isFieldValid }),
                functionName: 'input',
            }
        case 'review':
            return review(config, _newState, null)
        case 'success':
            // CHECK IF USER HAS ALREADY SUBMITTED
            // biome-ignore lint/style/useSingleCaseStatement: <explanation>
            if (config.allowDuplicates == false) {
                if (UserState.isOldUser) {
                    const index = getIndexForFid(fid, _newState)
                    _newState.data = [
                        ..._newState.data.slice(0, index),
                        ..._newState.data.slice(index + 1),
                    ]
                }
            }
            _newState = Object.assign(_newState, {
                data: [
                    ...(_newState.data || []),
                    { fid, inputValues: UserState.inputValues, timestamp: new Date().getTime() },
                ],
            })
            resetUserState()
            updateUserState({ pageType: 'success' })
            return {
                buttons: [
                    {
                        label: 'Back',
                    },
                ],
                state: _newState,
                aspectRatio: '1.91:1',
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
                state: _newState,
                aspectRatio: '1.91:1',
                component: SubmittedView(config),
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
