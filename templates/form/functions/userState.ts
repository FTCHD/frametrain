export interface SessionUserStateType{
  pageType: 'init' | 'home' | 'input' | 'review' | 'success' | 'submitted-before' | 'about' | undefined,
  inputValues: string[] | [],
  inputFieldNumber: number,
  totalInputFieldNumber: number
}

export const UserState: SessionUserStateType = {
  pageType: 'init',
  inputValues: [],
  inputFieldNumber: 0,
  totalInputFieldNumber: 0
};

export function updateUserState(updates: Partial<SessionUserStateType>) {
  Object.assign(UserState, updates);
}