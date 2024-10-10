'use server'
import type { frameTable } from '@/db/schema'
import type { BuildFrameData, FramePayloadValidated } from '@/lib/farcaster'
import type { InferSelectModel } from 'drizzle-orm'
import type { Config, Storage } from '..'

export default async function answer({
    frame,
    body,
    config,
    storage,
    params,
}: {
    frame: Pick<InferSelectModel<typeof frameTable>, 'id' | 'owner'>
    body: FramePayloadValidated
    config: Config
    storage: Storage
    params: any
}): Promise<BuildFrameData> {
    // this will be used to paywithglide

    return {}
}
