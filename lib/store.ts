import { atom } from 'jotai'
import type { getPreview } from './debugger'

export const previewHistoryAtom = atom<Awaited<ReturnType<typeof getPreview>>[]>([])

export const mockOptionsAtom = atom<string[] | undefined>(undefined)
