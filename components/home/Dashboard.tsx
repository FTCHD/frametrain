'use client'
import AccountButton from '@/components/foundation/AccountButton'
import TemplateCard from '@/components/home/TemplateCard'
import type { frameTable } from '@/db/schema'
import { getFrameList } from '@/lib/actions'
import templates from '@/templates'
import type { InferSelectModel } from 'drizzle-orm'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import ProjectCard from './ProjectCard'

export const runtime = 'edge'

export default function Dashboard() {
    const sesh = useSession()

    const [frames, setFrames] = useState<InferSelectModel<typeof frameTable>[]>([])

    useEffect(() => {
        if (!sesh || sesh.status !== 'authenticated') {
            return
        }

        async function loadFrames() {
            const frames = await getFrameList()
            setFrames(frames)
        }

        loadFrames()
    }, [sesh])

    return (
        <>
            <div className="flex flex-col w-full">
                {sesh.status !== 'authenticated' ? (
                    <div className="flex flex-col justify-center items-center h-full space-y-4">
                        <h1 className="text-4xl font-bold">Welcome to Frametrain!</h1>
                        <h1 className="text-xl ">Sign in with Farcaster to get started.</h1>
                        <AccountButton />
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col space-y-8 md:pl-8 p-4 w-full">
                            <h1 className="text-3xl font-semibold">🖼️ Frames</h1>
                            {frames.length ? (
                                <div className="flex flex-wrap  justify-start gap-4">
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

                        <div className="flex flex-col space-y-8 md:pl-8 p-4 ">
                            <h1 className="text-3xl font-semibold">💎 Templates</h1>
                            <div className="flex flex-col items-start  md:flex-row gap-4 flex-wrap ">
                                {Object.keys(templates).map((id) => (
                                    <TemplateCard
                                        key={id}
                                        template={templates[id as keyof typeof templates] as any}
                                        id={id}
                                    />
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    )
}
