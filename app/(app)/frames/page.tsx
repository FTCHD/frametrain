import { auth } from '@/auth'
import ProjectCard from '@/components/home/ProjectCard'
import { getFrameList } from '@/lib/frame'
import { ArrowLeftIcon } from 'lucide-react'
import type { Metadata } from 'next'
import NextLink from 'next/link'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
    title: 'Frames',
    description: 'A list of your Frames. Create, edit, and delete them here.',
    alternates: {
        canonical: 'https://frametra.in/frames',
    },
    icons: {
        icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🚂</text></svg>',
    },
    twitter: {
        title: 'Frames',
    },
    metadataBase: new URL('https://frametra.in'),
    openGraph: {
        title: 'Frames',
        type: 'website',
        url: 'https://frametra.in/frames',
        images: [
            {
                url: '/og.png',
                width: 1200,
                height: 630,
                alt: 'Frames',
                type: 'image/png',
            },
        ],
    },
    robots: 'noindex',
}

export default async function FrameList() {
    const sesh = await auth()

    if (!sesh?.user) {
        redirect('/')
    }

    const frames = await getFrameList()

    return (
        <div className="flex flex-col p-5 w-full h-full gap-5">
            <section className="flex flex-row justify-between items-center px-4 py-2">
                <NextLink href="/" className="text-5xl font-bold">
                    My Frames
                </NextLink>
            </section>
            <div className="flex flex-grow justify-center items-center">
                <div className="flex flex-col w-full">
                    <div className="flex flex-col p-4 space-y-8 w-full md:pl-4">
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
                        </div>
                        {frames.length ? (
                            <div className="flex flex-wrap gap-4 justify-start">
                                {frames.map((frame) => (
                                    <ProjectCard key={frame.id} frame={frame as any} />
                                ))}
                            </div>
                        ) : (
                            <h4 className="text-center">
                                No frames yet. <br /> <br /> Check out the templates on the home
                                page and create your first one!
                            </h4>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
