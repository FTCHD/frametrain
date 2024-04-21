import type { BaseConfig } from '@/lib/types'
import { createContext } from 'react'

export const InspectorContext = createContext<
    | {
          frameId: string
          config: BaseConfig
          update: (props: any) => void
      }
    | undefined
>(undefined)
