import type { StaticImageData } from 'next/image'
import type { ElementType } from 'react'
import type { BuildFrameData } from './farcaster'

export interface BaseConfig {
    [key: string]: boolean | number | string | null | undefined | any
}

export interface BaseStorage {
    [key: string]: boolean | number | string | null | undefined | any
}

export type BaseHandler = ({
    body,
    config,
    storage,
    params,
}: { body: any; config: any; storage: any; params: any }) => Promise<BuildFrameData>

export interface BaseHandlers {
    [key: string]: BaseHandler
}

type TemplateIcon =
    | 'number'
    | 'search'
    | 'image'
    | 'alert'
    | 'code'
    | 'meter'
    | 'ruby'
    | 'video'
    | 'filter'
    | 'stop'
    | 'plus'
    | 'info'
    | 'check'
    | 'book'
    | 'question'
    | 'mail'
    | 'home'
    | 'star'
    | 'inbox'
    | 'lock'
    | 'eye'
    | 'heart'
    | 'unlock'
    | 'play'
    | 'tag'
    | 'calendar'
    | 'database'
    | 'hourglass'
    | 'key'
    | 'gift'
    | 'sync'
    | 'archive'
    | 'bell'
    | 'bookmark'
    | 'briefcase'
    | 'bug'
    | 'clock'
    | 'credit-card'
    | 'globe'
    | 'infinity'
    | 'light-bulb'
    | 'location'
    | 'megaphone'
    | 'moon'
    | 'note'
    | 'pencil'
    | 'pin'
    | 'quote'
    | 'reply'
    | 'rocket'
    | 'shield'
    | 'stopwatch'
    | 'tools'
    | 'trash'
    | 'comment'
    | 'gear'
    | 'file'
    | 'hash'
    | 'square'
    | 'sun'
    | 'zap'
    | 'sign-out'
    | 'sign-in'
    | 'paste'
    | 'mortar-board'
    | 'history'
    | 'plug'
    | 'bell-slash'
    | 'diamond'
    | 'id-badge'
    | 'person'
    | 'smiley'
    | 'pulse'
    | 'beaker'
    | 'flame'
    | 'people'
    | 'person-add'
    | 'broadcast'
    | 'graph'
    | 'shield-check'
    | 'shield-lock'
    | 'telescope'
    | 'webhook'
    | 'accessibility'
    | 'report'
    | 'verified'
    | 'blocked'
    | 'bookmark-slash'
    | 'checklist'
    | 'circle-slash'
    | 'cross-reference'
    | 'dependabot'
    | 'device-camera'
    | 'device-camera-video'
    | 'device-desktop'
    | 'device-mobile'
    | 'dot'
    | 'eye-closed'
    | 'iterations'
    | 'key-asterisk'
    | 'law'
    | 'link-external'
    | 'list-ordered'
    | 'list-unordered'
    | 'log'
    | 'mention'
    | 'milestone'
    | 'mute'
    | 'no-entry'
    | 'north-star'
    | 'organization'
    | 'paintbrush'
    | 'paper-airplane'
    | 'project'
    | 'shield-x'
    | 'skip'
    | 'squirrel'
    | 'stack'
    | 'tasklist'
    | 'thumbsdown'
    | 'thumbsup'
    | 'typography'
    | 'unmute'
    | 'workflow'
    | 'versions' 


export interface BaseTemplate {
    name: string
    description: string
    //! define a string with max 20 characters "length"
    shortDescription?: string | undefined
    icon?: TemplateIcon | undefined
    creatorFid: string // must be a farcaster fid
    creatorName: string
    enabled: boolean
    Inspector: ElementType
    handlers: BaseHandlers
    initialConfig?: any
    cover: StaticImageData
    requiresValidation: boolean
    events: string[]
}
