'use server'
import { auth } from '@/auth'
import { frameTable } from '@/db/schema'
import templates from '@/templates'
import { getRequestContext } from '@cloudflare/next-on-pages'
import { type InferInsertModel, and, eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import { revalidatePath } from 'next/cache'
import { notFound } from 'next/navigation'

export async function getFrameList() {
    const sesh = await auth()

    if (!sesh?.user) {
        notFound()
    }

    const db = drizzle(getRequestContext().env.DB)

    const frames = await db
        .select()
        .from(frameTable)
        .where(eq(frameTable.owner, sesh.user.id!))
        .all()

    return frames
}

export async function getFrame(id: string) {
    const db = drizzle(getRequestContext().env.DB)

    const frame = await db.select().from(frameTable).where(eq(frameTable.id, id)).get()

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
        state: templates[template]?.initialState,
        template: template,
    }

    const db = drizzle(getRequestContext().env.DB)

    const frame = await db.insert(frameTable).values(args).returning().get()

    // revalidatePath(`/frame/${frame.id}`)

    return frame
}

export async function updateFrameName(id: string, name: string) {
    const db = drizzle(getRequestContext().env.DB)

    console.log('GOT HERE')
    console.log(id, name)

    await db.update(frameTable).set({ name }).where(eq(frameTable.id, id)).run()

    // revalidatePath(`/frame/${id}`)
}

// called only internally
export async function updateFrameConfig(id: string, config: any) {
    const db = drizzle(getRequestContext().env.DB)

    await db.update(frameTable).set({ config }).where(eq(frameTable.id, id)).run()

    // revalidatePath(`/frame/${id}`)
}

// called only internally
export async function updateFrameState(id: string, state: any) {
    const db = drizzle(getRequestContext().env.DB)

    await db.update(frameTable).set({ state }).where(eq(frameTable.id, id)).run()

    // revalidatePath(`/frame/${id}`)
}

export async function updateFrameCalls(id: string, calls: number) {
    const db = drizzle(getRequestContext().env.DB)

    await db.update(frameTable).set({ currentMonthCalls: calls }).where(eq(frameTable.id, id)).run()

    // revalidatePath(`/frame/${id}`)
}

export async function updateFramePreview(id: string, preview: string) {
    const db = drizzle(getRequestContext().env.DB)

    // extract whats after "property="og:image" content="data:image/svg+xml;base64," from preview
    let previewImage = preview.split('data:image/svg+xml;base64,')[1]
    previewImage = previewImage.split('"')[0]

    await db.update(frameTable).set({ preview: previewImage }).where(eq(frameTable.id, id)).run()

    // revalidatePath(`/frame/${id}`)
}

export async function deleteFrame(id: string) {
    const sesh = await auth()

    if (!sesh?.user) {
        notFound()
    }

    const db = drizzle(getRequestContext().env.DB)

    await db
        .delete(frameTable)
        .where(and(eq(frameTable.id, id), eq(frameTable.owner, sesh.user.id!)))
        .run()

    revalidatePath('/')
}
