import { client } from '@/db/client'
import { interactionTable } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(request: Request, { params }: { params: { frameId: string } }) {
    const interactions = await client
        .select()
        .from(interactionTable)
        .where(eq(interactionTable.frame, params.frameId))
        .all()

    return Response.json(interactions)
}