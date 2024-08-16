import { client } from '@/db/client'
import { frameTable } from '@/db/schema'
import { buildFrame } from '@/lib/serve'
import type { BaseConfig, BaseStorage } from '@/lib/types'
import { dimensionsForRatio } from '@/sdk/constants'
import templates from '@/templates'
import { ImageResponse } from '@vercel/og'
import { eq } from 'drizzle-orm'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Script from 'next/script'
import sharp from 'sharp'

export const revalidate = 3600

export async function generateMetadata({
    params,
}: { params: { frameId: string } }): Promise<Metadata> {
    const frame = await client
        .select()
        .from(frameTable)
        .where(eq(frameTable.id, params.frameId))
        .get()

    if (!frame) {
        notFound()
    }

    const template = templates[frame.template]

    const { initial } = template.handlers

    const buildParameters = await initial({
        body: undefined,
        config: frame.config as BaseConfig,
        storage: frame.storage as BaseStorage,
        params: {},
    })

    if (!buildParameters.component && !buildParameters.image) {
        throw new Error('Either component or image must be provided')
    }

    let imageData

    if (buildParameters.component) {
        const renderedImage = new ImageResponse(buildParameters.component, {
            ...dimensionsForRatio[buildParameters.aspectRatio === '1:1' ? '1/1' : '1.91/1'],
            fonts: buildParameters.fonts,
        })

        // get image data from vercel/og ImageResponse
        const bufferData = await renderedImage.arrayBuffer()

        // compress using sharp
        const compressedData = await sharp(bufferData)
            .png({
                quality: 40,
            })
            .timeout({ seconds: 1 })
            .toBuffer()

        imageData = 'data:image/png;base64,' + compressedData.toString('base64')
    } else {
        imageData = buildParameters.image!
    }

    const metadata = await buildFrame({
        buttons: buildParameters.buttons,
        image: imageData,
        aspectRatio: buildParameters.aspectRatio,
        inputText: buildParameters.inputText,
        refreshPeriod: buildParameters.refreshPeriod,
        postUrl: `${process.env.NEXT_PUBLIC_HOST}/f/${params.frameId}/${buildParameters.handler}`,
    })

    return {
        openGraph: {
            images: [{ url: imageData }],
        },
        other: metadata,
    }
}

export default async function Page({ params }: { params: { frameId: string } }) {
    const frame = await client
        .select()
        .from(frameTable)
        .where(eq(frameTable.id, params.frameId))
        .get()

    if (!frame) {
        notFound()
    }

    return (
        <>
            {frame.linkedPage && (
                <Script strategy="beforeInteractive">{`window.location.href = "${frame.linkedPage}"`}</Script>
            )}
            <h1 style={{ color: '#fff', fontFamily: 'system-ui' }}>
                &#128642; Hello from FrameTrain
            </h1>
        </>
    )
}