import templates from '@/templates'
import ms from 'ms'
import { unstable_cache } from 'next/cache'

export const getFeaturedTemplates = unstable_cache(
    async () => {
        const FEATURED_IDS = ['cal', 'figma', 'poll', 'pdf']

        const featuredTemplates = Object.entries(templates)
            .filter(([name, template]) => FEATURED_IDS.includes(name))
            .map(([name, template]) => template)

        return featuredTemplates
    },
    [],
    {
        revalidate: ms('1d') / 1000,
    }
)

export const getTemplates = unstable_cache(
    async () => {
        return templates
    },
    [],
    {
        revalidate: ms('1d') / 1000,
    }
)

export const getTemplate = unstable_cache(
    async (name: keyof typeof templates) => {
        return templates[name]
    },
    [],
    {
        revalidate: ms('1d') / 1000,
    }
)