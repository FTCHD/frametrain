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

export type UsersStateType = {
    [fid: string]: SessionUserStateType
} | Record<string, never>

export let UsersState: UsersStateType = {}

export function removeFidFromUserState(fid: number): void {
    if (UsersState && fid in UsersState) {
        const { [fid.toString()]: _, ...rest } = UsersState;
        UsersState = rest;
    }
}

export function updateUserState(fid: number, userState: Partial<SessionUserStateType>): void {
    if (UsersState && typeof UsersState === 'object') {
        UsersState = {
            ...UsersState,
            [fid.toString()]: {
                ...UsersState[fid.toString()],
                ...userState
            }
        };
    } else {
        UsersState = { [fid.toString()]: userState as SessionUserStateType };
    }
}