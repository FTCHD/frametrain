import type { frameTable } from '@/db/schema'
import type { InferSelectModel } from 'drizzle-orm'
import PageClient from './PageClient'

export default async function Page({
    frame,
    user,
}: {
    frame: InferSelectModel<typeof frameTable>
    user: { fid: string; username: string } | undefined
}) {
    return <PageClient user={user} frame={frame} />
}
