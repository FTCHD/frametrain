'use server'

import { S3 } from '@aws-sdk/client-s3'

const s3bucket = new S3({
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION,
    credentials: {
        accessKeyId: process.env.S3_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET!,
    },
})

export async function uploadImage({
    frameId,
    base64String,
    buffer,
    title,
    contentType,
}: {
    frameId: string
    base64String?: string | undefined
    buffer?: Buffer | undefined
    title: string
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

    const filename = `${title}.${contentType.split('/')[1]}`
    const filePath = `frames/${frameId}/${filename}`

    const params = {
        Bucket: process.env.S3_BUCKET,
        Key: filePath,
        Body: content,
        ContentType: contentType,
    }

    console.log('GOT HERE')

    try {
        await s3bucket.putObject(params)

        console.log('SUCCESS')

        return { filename }
    } catch (error) {
        console.log(error)

        return { filename: undefined }
    }
}
