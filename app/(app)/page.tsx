import { auth } from '@/auth'
import AccountButton from '@/components/foundation/AccountButton'
import Header from '@/components/foundation/Header'
import ProjectCard from '@/components/home/ProjectCard'
import TemplateCard from '@/components/home/TemplateCard'
import { Button } from '@/components/shadcn/Button'
import { getRecentFrameList } from '@/lib/frame'
import { getFeaturedTemplates, getTemplates } from '@/lib/template'
import { ArrowRightIcon } from 'lucide-react'
import NextLink from 'next/link'

export default async function Home() {
    const sesh = await auth()
	
	let templates:
    | Awaited<ReturnType<typeof getFeaturedTemplates>>
    | Awaited<ReturnType<typeof getTemplates>> = []
	
	let recentFrames: Awaited<ReturnType<typeof getRecentFrameList>> = []

    if (sesh?.user) {
        recentFrames = await getRecentFrameList()

        templates = await getFeaturedTemplates()
    } else {
        templates = await getTemplates()
    }

    return (
        <div className="flex flex-col w-full h-full lg:container">
            <Header />
            <div className="flex flex-grow justify-center items-center">
                <div className="flex flex-col w-full">
                    <div className="flex flex-col p-4 space-y-8 w-full mb-6">
                        <div className="flex flex-row w-full items-center gap-8">
                            <h2 className="text-3xl font-semibold">🖼️ Frames</h2>
                            {sesh?.user && (
                                <NextLink href="/frames">
                                    <p className="group text-sm flex flex-row gap-1 items-center text-[#ffffff90] border border-[#ffffff30] rounded-xl p-1 px-3 hover:border-[#ffffff90]">
                                        View all{' '}
                                        <ArrowRightIcon
                                            color="#ffffff90"
                                            size={16}
                                            className="ml-1 group-hover:m-0 transition-all duration-300"
                                        />
                                    </p>
                                </NextLink>
                            )}
                        </div>
                        {sesh?.user ? (
                            recentFrames.length ? (
                                <div className="flex flex-wrap gap-4 justify-start">
                                    {recentFrames.map((frame) => (
                                        <ProjectCard key={frame.id} frame={frame as any} />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center">
                                    No frames yet. <br /> <br /> Check out the templates below and
                                    create your first one!
                                </p>
                            )
                        ) : (
                            <div className="flex flex-col justify-between items-center space-y-4">
                                <h1 className="text-3xl font-bold text-center md:text-4xl">Welcome to Frametrain!</h1>
                                <p className="text-gray-300 text-base text-center md:text-lg">Sign in with Farcaster to get started</p>
                                <AccountButton />
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col p-4 space-y-8 md:pl-4">
                        <div className="flex flex-row w-full items-center justify-between">
                            <h2 className="text-2xl font-semibold md:text-3xl">💎 Templates</h2>
                            <NextLink href="/templates">
                                <p className="group text-sm flex flex-row gap-1 items-center text-[#ffffff90] border border-[#ffffff30] rounded-xl p-1 px-3 hover:border-[#ffffff90]">
                                    All templates{' '}
                                    <ArrowRightIcon
                                        color="#ffffff90"
                                        size={16}
                                        className="ml-1 group-hover:m-0 transition-all duration-300"
                                    />
                                </p>
                            </NextLink>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
                            {Object.values(templates).map((template) => (
                                <TemplateCard key={template.name} template={template} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col w-full justify-between items-center p-4 gap-8">
                <NextLink href="/templates">
                    <Button variant={'primary'} size={'lg'}>
                        BROWSE TEMPLATES
                    </Button>
                </NextLink>
                <NextLink
                    style={{ textDecoration: 'none' }}
                    href={
                        'https://github.com/FTCHD/frametrain?tab=readme-ov-file#revenue-sharing-wip'
                    }
                >
                    <p className="text-sm font-medium hover:text-blue-500 hover:font-bold transition-all duration-140">
                        🔍 Looking for a template? Build it yourself and get paid for it!
                    </p>
                </NextLink>
            </div>
        </div>
    )
}
