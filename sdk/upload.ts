'use server'
import { upload } from '@/lib/storage'
import { nanoid } from 'nanoid'

export async function uploadImage({
    frameId,
    base64String,
    buffer,
    contentType,
}: {
    frameId: string
    base64String?: string | undefined
    buffer?: Buffer | undefined
    contentType: 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp'
}) {
    if (!['image/png', 'image/jpeg', 'image/gif', 'image/webp'].includes(contentType)) {
        throw new Error('Invalid content type')
    }

    let content: Buffer | undefined

    if (base64String) {
        content = Buffer.from(base64String, 'base64')
    }

    if (buffer) {
        content = buffer
    }

    if (!content) {
        throw new Error('No content')
    }

    const id = nanoid()
    const name = `${id}.${contentType.split('/')[1]}`
    const path = `frames/${frameId}/${name}`

    try {
        await upload({
            path: path,
            type: contentType,
            content: content,
        })

        console.log('[uploadImage] Uploaded ', path)

        return { fileName: name, filePath: path }
    } catch (error) {
        console.log('[uploadImage] Failed to upload ', path, error)

        return { fileName: undefined, filePath: undefined }
    }
}
