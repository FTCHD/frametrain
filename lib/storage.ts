'use server'
import { S3 } from '@aws-sdk/client-s3'

export async function upload({
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

        // console.log('[uploadPreview] Uploaded ', `frames/${frameId}/preview.png`)
    } catch (error) {
        // console.log('[uploadPreview] Failed to upload ', `frames/${frameId}/preview.png`, error)
    }
}