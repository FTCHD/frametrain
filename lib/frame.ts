'use server'
import { auth } from '@/auth'
import { client } from '@/db/client'
import { frameTable } from '@/db/schema'
import templates from '@/templates'
import { type InferInsertModel, and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { notFound } from 'next/navigation'
import { uploadPreview } from './storage'

export async function getFrameList() {
    const sesh = await auth()

    if (!sesh?.user) {
        notFound()
    }

    const frames = await client
        .select()
        .from(frameTable)
        .where(eq(frameTable.owner, sesh.user.id!))
        .all()

    return frames
}

export async function getFrame(id: string) {
    const sesh = await auth()

    if (!sesh?.user) {
        notFound()
    }

    const frame = await client
        .select()
        .from(frameTable)
        .where(and(eq(frameTable.id, id), eq(frameTable.owner, sesh.user.id!)))
        .get()

    if (!frame) {
        notFound()
    }

    return frame
}

export async function createFrame({
    name,
    description,
    template,
}: {
    name: string
    description?: string
    template: keyof typeof templates
}) {
    const sesh = await auth()

    if (!sesh?.user) {
        notFound()
    }

    const args: InferInsertModel<typeof frameTable> = {
        owner: sesh.user.id!,
        name,
        description,
        config: templates[template].initialConfig,
        draftConfig: templates[template].initialConfig,
        state: {},
        template: template,
    }

    const frame = await client.insert(frameTable).values(args).returning().get()

    return frame
}

export async function updateFrameName(id: string, name: string) {
    const sesh = await auth()

    if (!sesh?.user) {
        notFound()
    }

    await client
        .update(frameTable)
        .set({ name })
        .where(and(eq(frameTable.id, id), eq(frameTable.owner, sesh.user.id!)))
        .run()

    revalidatePath(`/frame/${id}`)
}

export async function updateFrameConfig(id: string, config: any) {
    const sesh = await auth()

    if (!sesh?.user) {
        notFound()
    }

    await client
        .update(frameTable)
        .set({ draftConfig: config })
        .where(and(eq(frameTable.id, id), eq(frameTable.owner, sesh.user.id!)))
        .run()

    revalidatePath(`/frame/${id}`)
}

export async function publishFrameConfig(id: string) {
    const sesh = await auth()

    if (!sesh?.user) {
        notFound()
    }

    const frame = await client
        .select()
        .from(frameTable)
        .where(and(eq(frameTable.id, id), eq(frameTable.owner, sesh.user.id!)))
        .get()

    if (!frame) {
        notFound()
    }

    await client
        .update(frameTable)
        .set({ config: frame.draftConfig })
        .where(and(eq(frameTable.id, id), eq(frameTable.owner, sesh.user.id!)))
        .run()

    revalidatePath(`/frame/${id}`)
}

export async function revertFrameConfig(id: string) {
    const sesh = await auth()

    if (!sesh?.user) {
        notFound()
    }

    const frame = await client
        .select()
        .from(frameTable)
        .where(and(eq(frameTable.id, id), eq(frameTable.owner, sesh.user.id!)))
        .get()

    if (!frame) {
        notFound()
    }

    await client
        .update(frameTable)
        .set({ draftConfig: frame.config })
        .where(and(eq(frameTable.id, id), eq(frameTable.owner, sesh.user.id!)))
        .run()

    revalidatePath(`/frame/${id}`)
}

export async function updateFrameState(id: string, state: any) {
    await client.update(frameTable).set({ state }).where(eq(frameTable.id, id)).run()
}

export async function updateFrameCalls(id: string, calls: number) {
    await client.update(frameTable).set({ currentMonthCalls: calls }).where(eq(frameTable.id, id)).run()
}

export async function updateFramePreview(id: string, preview: string) {
    // extract whats after "property="og:image" content="data:image/png;base64," from preview
    let previewImage = preview.split('data:image/png;base64,')[1]
    previewImage = previewImage.split('"')[0]

    await uploadPreview({
        frameId: id,
        base64String: previewImage,
    })
}

export async function deleteFrame(id: string) {
    const sesh = await auth()

    if (!sesh?.user) {
        notFound()
    }

    await client
        .delete(frameTable)
        .where(and(eq(frameTable.id, id), eq(frameTable.owner, sesh.user.id!)))
        .run()

    revalidatePath('/')
}
