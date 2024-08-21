import templates from '@/templates'
import { unstable_cache } from 'next/cache'

export const getFeaturedTemplates = unstable_cache(async () => {
    const FEATURED_IDS = ['cal', 'figma', 'poll', 'pdf']

    const featuredTemplates = Object.entries(templates)
        .filter(([name, template]) => FEATURED_IDS.includes(name))
        .map(([name, template]) => template)

    return featuredTemplates
})

export const getTemplates = unstable_cache(async () => {
    return templates
})

export const getTemplate = unstable_cache(async (name: keyof typeof templates) => {
    return templates[name]
})