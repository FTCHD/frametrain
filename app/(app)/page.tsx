import { auth } from '@/auth'
import AccountButton from '@/components/foundation/AccountButton'
import Header from '@/components/foundation/Header'
import ProjectCard from '@/components/home/ProjectCard'
import TemplateCard from '@/components/home/TemplateCard'
import { getRecentFrameList } from '@/lib/frame'
import templates from '@/templates'
import { ArrowRightIcon } from 'lucide-react'
import Image from 'next/image'
import NextLink from 'next/link'

export default async function Home() {
    const sesh = await auth()

    if (!sesh?.user) {
        return (
            <div className="flex flex-col justify-center p-5 w-full h-full gap-10">
                <div className="relative flex basis-1/4 md:basis-3/4">
                    <Image
                        src="/og-transparent.webp"
                        fill={true}
                        objectFit="contain"
                        alt="FrameTrain"
                    />
                </div>

                <div className="flex flex-col justify-between items-center space-y-4">
                    <h1 className="text-4xl font-bold">Welcome to Frametrain!</h1>
                    <h1 className="text-xl">Sign in with Farcaster to get started.</h1>
                    <AccountButton />
                </div>
            </div>
        )
    }

    const frames = await getRecentFrameList()

    return (
        <div className="flex flex-col p-5 w-full h-full gap-5">
            <Header />
            <div className="flex flex-grow justify-center items-center">
                <div className="flex flex-col w-full">
                    <div className="flex flex-col p-4 space-y-8 w-full md:pl-4">
                        <div className="flex flex-row w-full items-center gap-8">
                            <h1 className="text-3xl font-semibold">🖼️ Frames</h1>
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
                        </div>
                        {frames.length ? (
                            <div className="flex flex-wrap gap-4 justify-start">
                                {frames.map((frame) => (
                                    <ProjectCard key={frame.id} frame={frame as any} />
                                ))}
                            </div>
                        ) : (
                            <h4 className="text-center">
                                No frames yet. <br /> <br /> Check out the templates below and
                                create your first one!
                            </h4>
                        )}
                    </div>

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
