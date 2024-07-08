import { atom } from 'jotai'
import type { getPreview } from './debugger'

export const previewHistoryAtom = atom<Awaited<ReturnType<typeof getPreview>>[]>([])

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
