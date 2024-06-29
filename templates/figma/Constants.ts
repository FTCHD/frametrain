import type { ButtonConfig, SlideConfig } from './Config'

export const INITIAL_SLIDE_ID = 'initial'

export const INITIAL_BUTTONS: ButtonConfig[] = [
    {
        id: '1',
        enabled: false,
        caption: '',
        target: '',
        link: undefined,
    },
    {
        id: '2',
        enabled: false,
        caption: '',
        target: '',
        link: undefined,
    },
    {
        id: '3',
        enabled: false,
        caption: '',
        target: '',
        link: undefined,
    },
    {
        id: '4',
        enabled: false,
        caption: '',
        target: '',
        link: undefined,
    },
]

export const DEFAULT_SLIDES: SlideConfig[] = [
    {
        id: INITIAL_SLIDE_ID,
        title: 'Initial slide',
        aspectRatio: '1:1',
        description: 'What users will see while scrolling their feed',
        figmaUrl: undefined,
        textLayers: {},
        buttons: INITIAL_BUTTONS,
    },
]
