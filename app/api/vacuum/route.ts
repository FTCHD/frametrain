import { client } from '@/db/client'
import { frameTable } from '@/db/schema'
import { S3 } from '@aws-sdk/client-s3'
import { notFound } from 'next/navigation'

export async function GET() {
    try {
        const frames = await client.select().from(frameTable).all()

        if (!frames.length) {
            notFound()
        }

        const s3 = new S3({
            endpoint: process.env.S3_ENDPOINT,
            region: process.env.S3_REGION,
            credentials: {
                accessKeyId: process.env.S3_KEY_ID!,
                secretAccessKey: process.env.S3_SECRET!,
            },
        })
        const objects = await s3.listObjects({ Bucket: `${process.env.S3_BUCKET}` })
        const files = (objects.Contents ?? []).map((object) => object.Key) as string[]
        const foundFiles: string[] = []

        console.log(`Found ${files.length} files in R2 and ${frames.length} frames in the database`)

        for (const frame of frames) {
            const draftConfig = frame.draftConfig ?? {}
            const urls = collectFilePaths(draftConfig)
            foundFiles.push(...urls)
        }

        const filesToDelete = files.filter((file) => !foundFiles.includes(file))

        await deleteFilesFromR2(s3, filesToDelete)

        return Response.json({
            files: files.length,
            filesToDelete: filesToDelete.length,
            foundFiles: foundFiles.length,
        })
    } catch (e) {
        const error = e as Error
        return Response.json(error.message, { status: 500 })
    }
}

function collectFilePaths(jsonObject: any): string[] {
    const baseUrl = `${process.env.NEXT_PUBLIC_CDN_HOST}/`

    const urls: string[] = []
    function traverse(obj: any) {
        if (typeof obj === 'object' && obj !== null) {
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    const value = obj[key]
                    if (typeof value === 'string' && value.startsWith(baseUrl)) {
                        urls.push(value.replace(baseUrl, ''))
                    } else if (typeof value === 'object' && value !== null) {
                        traverse(value)
                    }
                }
            }
        }
    }

    traverse(jsonObject)
    return urls
}

async function deleteFilesFromR2(s3: S3, files: string[]) {
    if (files.length === 0) return
    const deleteParams = {
        Bucket: `${process.env.S3_BUCKET}`,
        Delete: {
            Objects: files.map((file) => ({ Key: file })),
        },
    }
    await s3.deleteObjects(deleteParams)
    console.log(`[deleteFilesFromR2] Deleted ${files.length} files`)
}
