'use server'
import { auth } from '@/auth'
import { client } from '@/db/client'
import { frameTable, interactionTable } from '@/db/schema'
import templates from '@/templates'
import { type InferInsertModel, and, count, desc, eq, getTableColumns } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { notFound } from 'next/navigation'
import { uploadPreview } from './storage'

type Frame = InferInsertModel<typeof frameTable>
type FrameId = Frame['id']
type UserId = Frame['owner']

const ensureAuth = async (): Promise<UserId> => {
    const sesh = await auth()
    if (!sesh?.user) notFound()
    return sesh.user.id!
}

const getFrameQuery = (userId: UserId, frameId?: FrameId) => {
    let query = client.select().from(frameTable).where(eq(frameTable.owner, userId))
    if (frameId) query = query.where(eq(frameTable.id, frameId))
    return query
}

export async function getFrameList(limit?: number) {
    const userId = await ensureAuth()
    const query = client
        .select({
            ...getTableColumns(frameTable),
            interactionCount: count(interactionTable.id),
        })
        .from(frameTable)
        .where(eq(frameTable.owner, userId))
        .leftJoin(interactionTable, eq(frameTable.id, interactionTable.frame))
        .groupBy(frameTable.id)
        .orderBy(desc(frameTable.updatedAt))

    if (limit) query.limit(limit)

    return query.all()
}

export const getRecentFrameList = () => getFrameList(8)

export async function getFrame(id: FrameId) {
    const userId = await ensureAuth()
    const frame = await getFrameQuery(userId, id).get()
    if (!frame) notFound()
    return frame
}

export async function duplicateFrame(id: FrameId) {
    const userId = await ensureAuth()
    const frame = await getFrame(id)
    const newFrame: Frame = {
        ...frame,
        owner: userId,
        name: `${frame.name} Copy`,
        description: frame.name,
        config: templates[frame.template].initialConfig,
        draftConfig: frame.draftConfig,
        storage: {},
    }
    await client.insert(frameTable).values(newFrame).run()
    revalidatePath('/')
}

export async function createFrame(frameData: Pick<Frame, 'name' | 'description' | 'template'>) {
    const userId = await ensureAuth()
    const newFrame: Frame = {
        owner: userId,
        config: templates[frameData.template].initialConfig,
        draftConfig: templates[frameData.template].initialConfig,
        storage: {},
        ...frameData,
    }
    return client.insert(frameTable).values(newFrame).returning().get()
}

async function updateFrame(id: FrameId, updates: Partial<Frame>) {
    const userId = await ensureAuth()
    await client
        .update(frameTable)
        .set(updates)
        .where(and(eq(frameTable.id, id), eq(frameTable.owner, userId)))
        .run()
    revalidatePath(`/frame/${id}`)
}

export const updateFrameName = (id: FrameId, name: string) => updateFrame(id, { name })
export const updateFrameConfig = (id: FrameId, config: any) =>
    updateFrame(id, { draftConfig: config })

export async function publishFrameConfig(id: FrameId) {
    const frame = await getFrame(id)
    const newDraftConfig = frame.draftConfig!
    await updateFrame(id, { config: newDraftConfig, draftConfig: newDraftConfig })
}

export const updateFrameLinkedPage = (id: FrameId, url?: string) =>
    updateFrame(id, { linkedPage: url })

export async function updateFrameWebhooks(id: FrameId, webhook: { event: string; url?: string }) {
    const frame = await getFrame(id)
    const webhooks = { ...frame.webhooks }
    if (webhook.url) {
        webhooks[webhook.event] = webhook.url
    } else {
        delete webhooks[webhook.event]
    }
    await updateFrame(id, { webhooks })
}

export async function revertFrameConfig(id: FrameId) {
    const frame = await getFrame(id)
    await updateFrame(id, { draftConfig: frame.config })
}

export const updateFrameStorage = (id: FrameId, storage: any) => updateFrame(id, { storage })
export const updateFrameCalls = (id: FrameId, calls: number) =>
    updateFrame(id, { currentMonthCalls: calls })

export async function updateFramePreview(id: FrameId, preview: string) {
    const previewImage = preview.split('data:image/png;base64,')[1].split('"')[0]
    await uploadPreview({ frameId: id, base64String: previewImage })
}

export async function deleteFrame(id: FrameId) {
    const userId = await ensureAuth()
    await client
        .delete(frameTable)
        .where(and(eq(frameTable.id, id), eq(frameTable.owner, userId)))
        .run()
    revalidatePath('/')
}
