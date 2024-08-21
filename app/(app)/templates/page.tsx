
import Header from '@/components/foundation/Header'
import TemplateCard from '@/components/home/TemplateCard'
import { getTemplates } from '@/lib/template'
import type { Metadata } from 'next'
import NextLink from 'next/link'

export const metadata: Metadata = {
    title: 'Farcaster Frame Templates',
    description:
        'Countless Farcaster templates like Cal Frames, Medium Frames, Gated Experiences Frames, Figma Frames, Form Frames, and more!',
    alternates: {
        canonical: 'https://frametra.in/templates',
    },
    icons: {
        icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🚂</text></svg>',
    },
    twitter: {
        title: 'Farcaster Frame Templates',
    },
    metadataBase: new URL('https://frametra.in'),
    openGraph: {
        title: 'Farcaster Frame Templates',
        type: 'website',
        url: 'https://frametra.in/templates',
        images: [
            {
                url: '/og.png',
                width: 1200,
                height: 630,
                alt: 'Farcaster Frame Templates',
                type: 'image/png',
            },
        ],
    },
}

export default async function TemplateList() {
	const templates = await getTemplates()
	
    return (
        <div className="flex flex-col p-5 w-full h-full gap-5">
            <Header />
            <div className="flex flex-grow justify-center items-center">
                <div className="flex flex-col w-full">
                    <div className="flex flex-col p-4 space-y-8 md:pl-4">
                        <h1 className="text-3xl font-semibold">💎 Templates</h1>
                        <div className="flex flex-col flex-wrap gap-4 items-start md:flex-row">
                            {Object.keys(templates).map((id) => (
                                <TemplateCard
                                    key={id}
                                    template={templates[id as keyof typeof templates] as any}
                                    id={id}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-row w-full justify-center items-center p-4 ">
                <NextLink
                    style={{ textDecoration: 'none' }}
                    href={'https://github.com/FTCHD/frametrain?tab=readme-ov-file#revenue-sharing'}
                >
                    <h1 className="text-sm font-medium hover:text-blue-500 hover:font-bold  transition-all duration-140">
                        🔍 Looking for a template? Build it yourself and get paid for it!
                    </h1>
                </NextLink>
            </div>
        </div>
    )
}
