import { auth } from '@/auth'
import Header from '@/components/foundation/Header'
import { client } from '@/db/client'
import { frameTable } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'

export default async function ShowPage({ params }: { params: { frameId: string } }) {
    const sesh = await auth()

    const frame = await client
        .select()
        .from(frameTable)
        .where(eq(frameTable.id, params.frameId))
        .get()

    if (!frame) {
        notFound()
    }

    const Page = await import('@/templates/' + frame.template + '/Page').then((t) => t.default)

    if (!Page) {
        notFound()
    }

    return (
        <div className="flex flex-col p-5 w-full h-full gap-5">
            <Header />
            <div className="flex flex-col p-5 w-full h-full gap-5">
                <Page
                    frame={frame}
                    user={
                        sesh?.user
                            ? {
                                  fid: sesh.user.id,
                                  username: sesh.user.name,
                              }
                            : undefined
                    }
                />
            </div>
        </div>
    )
}