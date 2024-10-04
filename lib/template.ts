import templates from '@/templates'
import ms from 'ms'
import { unstable_cache } from 'next/cache'

export type Template = {
    id: string
    name: string
    description: string
    shortDescription: string
    icon: string
    cover: string
    creatorFid: string
    creatorName: string
    enabled: boolean
    requiresValidation: boolean
}

export const getFeaturedTemplates = unstable_cache(
    async (): Promise<Template[]> => {
        const FEATURED_IDS = ['cal', 'figma', 'poll', 'pdf', 'podcast', 'nft'] as const

        const featuredTemplates = Object.entries(templates)
            .filter(([id]) => FEATURED_IDS.includes(id as (typeof FEATURED_IDS)[number]))
            .map(
                ([id, template]) =>
                    ({
                        ...template,
                        id,
                    }) as unknown as Template
            )

        return featuredTemplates
    },
    [],
    {
        tags: ['templates'],
        revalidate: ms('1m') / 1000,
    }
)

export const getTemplates = unstable_cache(
    async (): Promise<Template[]> => {
        return Object.entries(templates).map(
            ([id, template]) =>
                ({
                    ...template,
                    id,
                }) as unknown as Template
        )
    },
    [],
    {
        tags: ['templates'],
        revalidate: ms('1m') / 1000,
    }
)

export const getTemplate = unstable_cache(
    async <T extends keyof typeof templates>(id: T): Promise<Template> => {
        const template = templates[id]
        return {
            ...template,
            id: id,
        } as unknown as Template
    },
    [],
    {
        tags: ['templates'],
        revalidate: ms('1m') / 1000,
    }
)
