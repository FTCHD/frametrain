'use server'

import { S3 } from '@aws-sdk/client-s3'
import { nanoid } from 'nanoid'

async function upload({
    path,
    type,
    content,
}: {
    path: string
    type: string
    content: Buffer
}) {
    const params = {
        Bucket: process.env.S3_BUCKET,
        Key: path,
        Body: content,
        ContentType: type,
    }

    const bucket = new S3({
        endpoint: process.env.S3_ENDPOINT,
        region: process.env.S3_REGION,
        credentials: {
            accessKeyId: process.env.S3_KEY_ID!,
            secretAccessKey: process.env.S3_SECRET!,
        },
    })

    try {
        await bucket.putObject(params)
    } catch (error) {
        throw new Error('Failed to upload image')
    }
}

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

        return { fileName: name }
    } catch (error) {
        console.log('[uploadImage] Failed to upload ', path, error)

        return { fileName: undefined }
    }
}

export async function uploadPreview({
    frameId,
    base64String,
}: {
    frameId: string
    base64String: string
}) {
    try {
        await upload({
            path: `frames/${frameId}/preview.png`,
            type: 'image/png',
            content: Buffer.from(base64String, 'base64'),
        })

        console.log('[uploadPreview] Uploaded ', `frames/${frameId}/preview.png`)
    } catch (error) {
        console.log('[uploadPreview] Failed to upload ', `frames/${frameId}/preview.png`, error)
    }
}