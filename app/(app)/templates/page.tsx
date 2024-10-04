import AccountButton from '@/components/foundation/AccountButton'
import TemplateCard from '@/components/home/TemplateCard'
import { getTemplates } from '@/lib/template'
import { ArrowLeftIcon } from 'lucide-react'
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
            <section className="flex flex-row justify-between items-center px-4 py-2">
                <NextLink href="/" className="text-5xl font-bold">
                    Frames Templates
                </NextLink>
                <AccountButton />
            </section>
            <div className="flex flex-grow justify-center items-center">
                <div className="flex flex-col w-full">
                    <div className="flex flex-col p-4 space-y-8 md:pl-4">
                        <div className="flex flex-col gap-2">
                            <NextLink href="/" className="w-fit">
                                <p className="group text-sm flex flex-row gap-1 items-center text-[#ffffff90] border border-[#ffffff30] rounded-xl p-1 px-3 hover:border-[#ffffff90]">
                                    <ArrowLeftIcon
                                        color="#ffffff90"
                                        size={16}
                                        className="ml-1 group-hover:m-0 transition-all duration-300"
                                    />{' '}
                                    Back
                                </p>
                            </NextLink>

                            <h1 className="text-lg">
                                Pick a template by tapping the "plus" sign, and if you're not sure
                                what to use —
                                <NextLink
                                    href="https://warpcast.com/~/channel/frametrain"
                                    target="_blank"
                                >
                                    {' '}
                                    join the FrameTrain channel!
                                </NextLink>
                            </h1>
                        </div>
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
