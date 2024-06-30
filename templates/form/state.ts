export interface SessionUserStateType {
    pageType:
        | 'init'
        | 'home'
        | 'input'
        | 'success'
        | 'confirm_submit'
        | 'confirm_overwrite'
        | 'about'
        | undefined
    inputValues: string[] | []
    inputFieldNumber: number
    totalInputFieldNumber: number
    isOldUser?: boolean
}

export type UsersStateType =
    | {
          [fid: number]: SessionUserStateType
      }
    | Record<number, never>

export let UsersState: UsersStateType = {}

export function removeFidFromUserState(fid: number): void {
    if (UsersState && fid in UsersState) {
        const { [fid]: _, ...rest } = UsersState
        UsersState = rest
    }
}

export function updateUserState(fid: number, userState: Partial<SessionUserStateType>): void {
    if (UsersState && typeof UsersState === 'object') {
        UsersState = {
            ...UsersState,
            [fid]: {
                ...UsersState[fid],
                ...userState,
            },
        }
    } else {
        UsersState = { [fid]: userState as SessionUserStateType }
    }
}