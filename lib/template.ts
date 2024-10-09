import templates from '@/templates'
import ms from 'ms'
import { unstable_cache } from 'next/cache'

export const getFeaturedTemplates = unstable_cache(
    async () => {
        const FEATURED_IDS = ['cal', 'figma', 'poll', 'presentation']

        const featuredTemplates = Object.entries(templates)
            .filter(([id, template]) => FEATURED_IDS.includes(id))
            .map(([id, template]) => {
                return {
                    id: id,
                    name: template.name,
                    description: template.description,
                    shortDescription: template.shortDescription,
                    icon: template.icon,
                    cover: template.cover,
                    creatorFid: template.creatorFid,
                    creatorName: template.creatorName,
                    enabled: template.enabled,
                    requiresValidation: template.requiresValidation,
                }
            })

        return featuredTemplates
    },
    [],
    {
        revalidate: ms('1d') / 1000,
    }
)

export const getTemplates = unstable_cache(
    async () => {
        const allTemplates = Object.entries(templates)
            .filter(([, template]) => template.enabled)
            .map(([id, template]) => {
                return {
                    id: id,
                    name: template.name,
                    description: template.description,
                    shortDescription: template.shortDescription,
                    icon: template.icon,
                    cover: template.cover,
                    creatorFid: template.creatorFid,
                    creatorName: template.creatorName,
                    enabled: template.enabled,
                    requiresValidation: template.requiresValidation,
                }
            })

        return allTemplates
    },
    [],
    {
        revalidate: ms('1d') / 1000,
    }
)

export const getTemplate = unstable_cache(
    async (id: keyof typeof templates) => {
        const template = templates[id]
        return {
            id: id,
            name: template.name,
            description: template.description,
            shortDescription: template.shortDescription,
            icon: template.icon,
            cover: template.cover,
            creatorFid: template.creatorFid,
            creatorName: template.creatorName,
            enabled: template.enabled,
            requiresValidation: template.requiresValidation,
        }
    },
    [],
    {
        revalidate: ms('1d') / 1000,
    }
)
