export interface BaseConfig {
    requiresValidation: boolean

    frameId: string
    [key: string]: boolean | number | string | null | undefined | any
}

export interface BaseState {
    [key: string]: boolean | number | string | null | undefined | any
}

// a type with a function named preview, initial, and other defined functions for each key in BaseSlide
export interface BaseFunctions {
    initial: (config: any, state: any) => any
    [key: string]: (body: any, config: any, state: any, params: any) => any
}

export interface BaseTemplate {
    name: string
    description: string
    creatorFid: string // must be a farcaster fid
    creatorName: string
    enabled: boolean
    // biome-ignore lint/correctness/noUndeclaredVariables: <>
    Inspector: JSX.ElementType
    functions: BaseFunctions
    initialState?: any
    initialConfig?: any
}