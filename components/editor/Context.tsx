import type { BaseConfig, BaseState } from '@/lib/types'
import { createContext } from 'react'

export const InspectorContext = createContext<
    | {
          frameId: string
          config: BaseConfig
          state: BaseState
          update: (props: any) => void
          fid: string
      }
    | undefined
>(undefined)
