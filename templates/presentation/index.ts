import type { BaseState, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.jpeg'
import functions from './functions'

export interface State extends BaseState {}

export default {
    name: 'Presentation Template',
    description: 'Turn your images and long texts into a slideshow.',
    creatorFid: '661506',
    creatorName: 'oynozan',
    cover,
    enabled: true,
    Inspector,
    functions,
    requiresValidation: false,
} satisfies BaseTemplate
