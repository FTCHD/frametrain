export interface Config {
    coverType: 'image' | 'basicView'
    coverImage?: string
    coverTitle: string
    coverSubtitle?: string
    coverBottomMessage?: string
    submittedType: 'image' | 'basicView'
    submittedImage?: string
    submittedTitle: string
    submittedSubtitle?: string
    submittedBottomMessage?: string
    paymentEnabled: boolean
    paymentAmount?: number
    paymentAddress?: string
    publicSubmissions: boolean
    gating: GatingOptions
}

export interface Storage {
    questions: Question[]
    payments: Payment[]
}

export interface Question {
    id: string
    text: string
    answer?: string
    fid: number
    username: string
}

export interface Payment {
    questionId: string
    fid: number
}

export interface GatingOptions {
    followersOnly: boolean
    followingOnly: boolean
    minimumFollowers: number
    minimumFollowing: number
    allowList: string[]
}

export type ViewType = 'cover' | 'question' | 'answer' | 'answered' | 'submitted'
