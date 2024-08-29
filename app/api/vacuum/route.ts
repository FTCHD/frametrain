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
        const frameIdsWithCdnRoute: string[] = []

        for (const frame of frames) {
            const config = frame.config ?? {}
            // some empty configs are saved as '{}' or {}
            if (typeof config === 'string' || Object.keys(config).length === 0) continue
            if (hasCdnRoute(frame.config, frame.id)) {
                frameIdsWithCdnRoute.push(frame.id)
            }
        }

        const filesToDelete = files.filter((file) => {
            const frameId = file.split('/')[1]
            return !frameIdsWithCdnRoute.includes(frameId)
        })

        await deleteFilesFromR2(s3, filesToDelete)

        return Response.json({
            frameIdsWithCdnRoute,
            filesToDelete: {
                length: filesToDelete.length,
                files: filesToDelete,
            },
        })
    } catch (e) {
        const error = e as Error
        return Response.json(error.message, { status: 500 })
    }
}

function hasCdnRoute(config: any, frameId: string): boolean {
    const cdnWithId = `${process.env.NEXT_PUBLIC_CDN_HOST}/${frameId}`
    if (typeof config === 'object') {
        for (const key in config) {
            if (
                (typeof config[key] === 'string' && config[key].startsWith(cdnWithId)) ||
                hasCdnRoute(config[key], frameId)
            ) {
                return true
            }
        }
    }
    return false
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
}
