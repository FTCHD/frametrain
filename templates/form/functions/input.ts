'use server'
import type { BuildFrameData, FrameActionPayload } from '@/lib/farcaster'
import { FrameError } from '@/sdk/handlers'
import type { Config, State } from '..'
import InputView from '../views/Input'
import SubmittedView from '../views/Submitted'
import SuccessView from '../views/Success'
import about from './about'
import initial from './initial'
import review from './review'
import { UsersState, removeFidFromUserState, updateUserState } from './userState'

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
export default async function input(
    body: FrameActionPayload,
    config: Config,
    state: State,
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

    // console.log("BEFORE SWITCH THE STATE IS : ", state);
    // console.log("BEFORE SWITCH THE USER STATE IS : ", UsersState);

    switch (prevUserState.pageType) {
        case 'init':
        case undefined: {
            // IF "ABOUT" BUTTON WAS PRESSED
            if (buttonIndex == 1) {
                updateUserState(fid, { pageType: 'about' })
                break
            }

            if (!config.allowDuplicates) {
                /* CHECK IF THE USER HAS SUBMITTED THE FORM BEFORE */
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

            if (buttonIndex == 2) {
                // IF "START" BUTTON WAS PRESSED
                updateUserState(fid, {
                    inputFieldNumber: 0,
                    totalInputFieldNumber: config.fields.length,
                })
                updateUserState(fid, { pageType: 'input' })
                break
            }
            break
        }
        case 'about': {
            // Back Button Pressed
            if (buttonIndex == 1) {
                updateUserState(fid, { pageType: 'init' })
            }
            break
        }
        case 'input': {
            //CHECK IF THE VALUE ENTERED IS VALID FOR THE TYPE
            if (buttonIndex == 1) {
                // IF RESET WAS PRESSED
                removeFidFromUserState(fid)
                updateUserState(fid, { pageType: 'init', inputValues: [] })
                break
            }
			
			
			const { isValid } = validateField(
                textInput,
                config.fields[UsersState[fid].inputFieldNumber].fieldType
            )

            if (!isValid) {
                // IF INVALID BREAK AND SHOW THE INVALID VALUE MESSAGE
                updateUserState(fid, { pageType: 'input' })
                throw new FrameError('Field not valid.')
            }
			
       
            if (config.fields[UsersState[fid].inputFieldNumber].required == true) {
                // CHECK IF THE INPUT IS A "REQUIRED" ONE
                if (
                    // biome-ignore lint/complexity/useSimplifiedLogicExpression: <explanation>
                    !(textInput.trim().length > 0) &&
                    !UsersState[fid].inputValues[UsersState[fid].inputFieldNumber]
                ) {
                    updateUserState(fid, { pageType: 'input' })
                    throw new FrameError('You cannot leave a required field blank.')
                }
            }
			

            // if (textInput.length > 0) {
            //     const _inputs = UsersState[fid].inputValues
            //     _inputs[UsersState[fid].inputFieldNumber] = textInput
            //     updateUserState(fid, { inputValues: _inputs })
            // }

            const _inputs = UsersState[fid].inputValues
            _inputs[UsersState[fid].inputFieldNumber] = textInput || ''
            updateUserState(fid, { inputValues: _inputs })
		

            if (prevUserState.inputFieldNumber + 1 == UsersState[fid].totalInputFieldNumber) {
                // if button pressed was NEXT_PAGE, show the review page
                if (buttonIndex == 3) {
                    updateUserState(fid, { pageType: 'review' })
                    break
                }
            }
            // IF ON FIRST INPUT FIELD
            if (prevUserState.inputFieldNumber == 0) {
                // if button pressed was PREV_PAGE show initial page
                if (buttonIndex == 2) {
                    updateUserState(fid, { pageType: 'init' })
                    break
                }
            }
            // IF PREV WAS PRESSED
            if (buttonIndex == 2) {
                updateUserState(fid, { inputFieldNumber: prevUserState.inputFieldNumber - 1 })
                break
            }
            // IF NEXT WAS PRESSED
            if (buttonIndex == 3) {
                updateUserState(fid, { inputFieldNumber: prevUserState.inputFieldNumber + 1 })
                break
            }
            break
        }
        case 'review': {
            // if pressed button was submit, show the success page
            if (buttonIndex == 2) {
                updateUserState(fid, { pageType: 'success' })
                break
            }

            // if pressed button was back, go through the form again
            if (buttonIndex == 1) {
                updateUserState(fid, { pageType: 'input', inputFieldNumber: 0 })
                break
            }
        }

        case 'submitted_before': {
            // ask if wants to submit a new one or not
            // IF BACK WAS PRESSED
            if (buttonIndex == 1) {
                updateUserState(fid, { pageType: 'init' })
                break
            }

            // IF CONTINUE WAS PRESSED
            if (buttonIndex == 2) {
                updateUserState(fid, { pageType: 'input', inputFieldNumber: 0 })
                break
            }
        }

        case 'success':
            // biome-ignore lint/style/useSingleCaseStatement: <explanation>
            removeFidFromUserState(fid)
            updateUserState(fid, { pageType: 'init', inputValues: [] })
            break
        default:
            break
    }

    switch (UsersState[fid].pageType) {
        case 'init':
            return initial(config, newState)
        case 'about':
            return about(config)
        case 'input':
            return {
                buttons: [
                    {
                        label: 'Reset',
                    },
                    {
                        label: '←',
                    },
                    {
                        label: '→',
                    },
                ],
                inputText: 'Enter The Value',
                state: newState,
                component: InputView(config, UsersState[fid]),
                functionName: 'input',
            }
        case 'review':
            return review(config, newState, fid, null)
        case 'success': {
            if (!config.allowDuplicates) {
                // CHECK IF USER HAS ALREADY SUBMITTED
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

    // RETURN INITIAL VIEW IF ANYTHING UNEXPECTED HAPPENS
    updateUserState(fid, { pageType: 'init', inputValues: [] })

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

function validateField(
    value: any,
    type: 'text' | 'number' | 'email' | 'phone' | 'address'
): { isValid: boolean; errors: string[] } {
    if (value.trim().length == 0) {
        return { isValid: true, errors: [] }
    }

    let isValid = true
    const errors: string[] = []

    switch (type) {
        case 'text': {
            isValid = typeof value === 'string' && value.trim().length > 0
            break
        }

        case 'number': {
            isValid = !isNaN(value) && !isNaN(Number.parseFloat(value))
            break
        }

        case 'email': {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            isValid = typeof value === 'string' && emailRegex.test(value)
            break
        }

        case 'phone': {
            const phoneRegex = /^\+?[1-9]\d{1,14}$/
            isValid = typeof value === 'string' && phoneRegex.test(value)
            break
        }

        case 'address': {
            isValid = typeof value === 'string' && value.trim().length > 0
            break
        }

        default:
            break
    }

    return { isValid, errors }
}
