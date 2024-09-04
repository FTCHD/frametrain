import { atom } from 'jotai'
import type { simulateCall } from './debugger'

export const previewLoadingAtom = atom(false)
export const previewErrorAtom = atom(false)
export const previewParametersAtom = atom<
    { handler?: string; buttonIndex: number; inputText: string; params?: string } | undefined
>(undefined)
export const previewStateAtom = atom<Awaited<ReturnType<typeof simulateCall>> | undefined>(
    undefined
)

export type MockOptions = {
    fid: number
    recasted: boolean
    liked: boolean
    following: boolean
    follower: boolean
}

export const mockOptionsAtom = atom<MockOptions>({
    fid: 0,
    recasted: false,
    liked: false,
    following: false,
    follower: false,
})
