import type { BaseConfig, BaseStorage } from '@/lib/types'
import { createContext } from 'react'

export const InspectorContext = createContext<
    | {
          frameId: string
          config: BaseConfig
          storage: BaseStorage
          update: (props: any) => void
          updateStorage: (props: any) => void
          fid: string
          fname: string
      }
    | undefined
>(undefined)
