export interface SessionUserStateType {
    pageType:
        | 'init'
        | 'home'
        | 'input'
        | 'review'
        | 'success'
        | 'submitted_before'
        | 'about'
        | undefined
    inputValues: string[] | []
    inputFieldNumber: number
    totalInputFieldNumber: number
    isFieldValid?: boolean
    isOldUser?: boolean
}

export let UserState: SessionUserStateType = {
    pageType: 'init',
    inputValues: [],
    inputFieldNumber: 0,
    totalInputFieldNumber: 0,
    isFieldValid: true,
}

export function updateUserState(updates: Partial<SessionUserStateType>) {
    Object.assign(UserState, updates)
}

export function resetUserState() {
    UserState = {
        pageType: 'init',
        inputValues: [],
        inputFieldNumber: 0,
        totalInputFieldNumber: 0,
        isFieldValid: true,
    }
}
