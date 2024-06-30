'use server'
import type { BuildFrameData, FrameActionPayloadValidated } from '@/lib/farcaster'
import { FrameError } from '@/sdk/handlers'
import type { Config, State } from '..'
import { UsersState, removeFidFromUserState, updateUserState } from '../state'
import { getIndexForFid, validateField } from '../utils'
import ConfirmOverwriteView from '../views/ConfirmOverwrite'
import ConfirmSubmitView from '../views/ConfirmSubmit'
import InputView from '../views/Input'
import SuccessView from '../views/Success'
import about from './about'
import initial from './initial'

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
export default async function input(
    body: FrameActionPayloadValidated,
    config: Config,
    state: State,
    params: any
): Promise<BuildFrameData> {
    const fid = body.validatedData.interactor.fid
    const buttonIndex = body.validatedData.tapped_button.index
    const textInput = body.validatedData?.input?.text || ''

    let newState = state

    if (!UsersState[fid]) {
        updateUserState(fid, { pageType: 'init', inputValues: [] })
    }

    const prevUserState = structuredClone(UsersState[fid])

    switch (prevUserState.pageType) {
        case undefined:
        case 'init': {
            // IF "ABOUT" BUTTON WAS PRESSED
            if (buttonIndex == 1) {
                updateUserState(fid, { pageType: 'about' })
                break
            }

            if (!config.allowDuplicates) {
                // CHECK IF THE USER HAS SUBMITTED THE FORM BEFORE
                const index = getIndexForFid(fid, newState)
                if (index >= 0) {
                    updateUserState(fid, {
                        pageType: 'confirm_overwrite',
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

            const _inputs = UsersState[fid].inputValues
            _inputs[UsersState[fid].inputFieldNumber] = textInput
            updateUserState(fid, { inputValues: _inputs })

            if (prevUserState.inputFieldNumber + 1 == UsersState[fid].totalInputFieldNumber) {
                // if button pressed was NEXT_PAGE, show the confirm_submit page
                if (buttonIndex == 3) {
                    updateUserState(fid, { pageType: 'confirm_submit' })
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
        case 'confirm_submit': {
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

        case 'confirm_overwrite': {
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

    // Display relevant page based on UserState (modified above)
    switch (UsersState[fid].pageType) {
        case 'init':
            return initial(config, newState)
        case 'about':
            return about(body, config, newState, params)
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
        case 'confirm_submit':
            return {
                buttons: [
                    {
                        label: '←',
                    },
                    {
                        label: 'Submit',
                    },
                ],
                state: newState,
                component: ConfirmSubmitView(config, UsersState[fid]),
                functionName: 'input',
            }
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
                        label: 'Home',
                    },
                    {
                        label: 'Create your own',
                        action: 'link',
                        target: 'https://frametra.in',
                    },
                ],
                state: newState,
                component: SuccessView(config),
                functionName: 'input',
            }
        }
        case 'confirm_overwrite':
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
                component: ConfirmOverwriteView(config),
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
