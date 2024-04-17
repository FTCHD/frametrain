'use client'
import AccountButton from '@/components/foundation/AccountButton'
import Header from '@/components/foundation/Header'
import ProjectCard from '@/components/home/ProjectCard'
import TemplateCard from '@/components/home/TemplateCard'
import type { frameTable } from '@/db/schema'
import { getFrameList } from '@/lib/actions'
import templates from '@/templates'
import type { InferSelectModel } from 'drizzle-orm'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

export const runtime = 'edge'

export default function Home() {
    const sesh = useSession()

    const [frames, setFrames] = useState<InferSelectModel<typeof frameTable>[]>([])

    useEffect(() => {
        if (!sesh || sesh.status !== 'authenticated') {
            return
        }

    	getFrameList().then((frames) => setFrames(frames))
    }, [sesh])

    return (
        <div className="flex flex-col p-5 w-full h-full">
            <Header />
            <div className="flex flex-grow justify-center items-center">
                <div className="flex flex-col w-full">
                    {sesh.status !== 'authenticated' ? (
                        <div className="flex flex-col justify-center items-center space-y-4 h-full">
                            <h1 className="text-4xl font-bold">Welcome to Frametrain!</h1>
                            <h1 className="text-xl">Sign in with Farcaster to get started.</h1>
                            <AccountButton />
                        </div>
                    ) : (
                        <>
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
                                        No frames yet. <br /> <br /> Check out the templates below
                                        and create your first one!
                                    </h4>
                                )}
                            </div>

                            <div className="flex flex-col p-4 space-y-8 md:pl-4">
                                <h1 className="text-3xl font-semibold">💎 Templates</h1>
                                <div className="flex flex-col flex-wrap gap-4 items-start md:flex-row">
                                    {Object.keys(templates).map((id) => (
                                        <TemplateCard
                                            key={id}
                                            template={
                                                templates[id as keyof typeof templates] as any
                                            }
                                            id={id}
                                        />
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
