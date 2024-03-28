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
