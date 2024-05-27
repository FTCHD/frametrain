import { auth } from '@/auth'
import AccountButton from '@/components/foundation/AccountButton'
import Header from '@/components/foundation/Header'
import ProjectCard from '@/components/home/ProjectCard'
import TemplateCard from '@/components/home/TemplateCard'
import { getFrameList } from '@/lib/frame'
import templates from '@/templates'
import NextLink from 'next/link'

export default async function Home() {
    const sesh = await auth()

    if (!sesh?.user) {
        return (
            <div className="flex flex-col p-5 w-full h-full gap-5">
                <Header />
                <div className="flex flex-grow justify-center items-center">
                    <div className="flex flex-col w-full">
                        <div className="flex flex-col justify-center items-center space-y-4 h-full">
                            <h1 className="text-4xl font-bold">Welcome to Frametrain!</h1>
                            <h1 className="text-xl">Sign in with Farcaster to get started.</h1>
                            <AccountButton />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const frames = await getFrameList()

    return (
        <div className="flex flex-col p-5 w-full h-full gap-5">
            <Header />
            <div className="flex flex-grow justify-center items-center">
                <div className="flex flex-col w-full">
                    <div className="flex flex-col p-4 space-y-8 w-full md:pl-4">
                        <h1 className="text-3xl font-semibold">🖼️ Frames</h1>
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
