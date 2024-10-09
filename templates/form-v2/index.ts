import type { BaseConfig, BaseStorage, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.avif'
import handlers from './handlers'
import icon from './icon.avif'

export type SlideButton =
    | {
          text: string
          type: 'link'
          target: string
      }
    | {
          text: string
          type: 'slide'
          target: number
      }
    | {
          text: string
          type: 'frame'
          target: string
      }

export type TextField = {
    type: 'text'
    label: string
    message: string
    regexp?: string
    placeholder: string
    required: boolean
}

export type ChoiceField = {
    type: 'choice'
    label: string
    message: string
    options: string[]
}

export type FormField = TextField | ChoiceField

export interface Config extends BaseConfig {
    coverType: 'disabled' | 'image' | 'text'
    coverImageUrl?: string
    coverAspectRatio: '1:1' | '1.91:1'
    coverStyling?: {
        title: { text: string }
        subtitle: { text: string }
        bottomMessage: { text: string }
        background: string
    }
    successType: 'disabled' | 'image' | 'text' | 'frame'
    successFrameUrl?: string
    successImageUrl?: string
    successAspectRatio: '1:1' | '1.91:1'
    successStyling?: {
        title: { text: string }
        subtitle: { text: string }
        bottomMessage: { text: string }
        background: string
    }
    successButtons?: SlideButton[]
    fields: FormField[]
}

export interface Storage extends BaseStorage {
    submissions: Record<string, Record<string, any>>
}

export default {
    name: 'Form V2',
    description: 'Create forms, save the user inputs, and even download them as CSV!',
    shortDescription: 'Download as CSV',
    octicon: 'project',
    creatorFid: '417554',
    creatorName: 'onten.eth',
    icon,
    cover,
    enabled: true,
    Inspector,
    handlers,
    initialConfig: {
        fields: [],
        successType: 'image',
    },
    events: [],
} satisfies BaseTemplate
