'use server'

import { ImageResponse } from 'next/og'
import sharp from 'sharp'

type RenderImagePreviewParams = {
    event: {
        id: string
        price: string
        backgroundCover: string
        hosts: string[]
        locationType: string
        date: string
        title: string
    }
}

export default async function renderImagePreview({ event }: RenderImagePreviewParams) {
    const host = event.hosts.length
        ? event.hosts.length === 1
            ? event.hosts[0]
            : event.hosts.slice(0, 3).join(', ')
        : 'UNKNOWN HOST'

    const rendered = new ImageResponse(
        <div tw="flex relative">
            <div tw="relative isolate flex w-full flex-col items-center justify-center bg-white">
                <img
                    src={event.backgroundCover}
                    alt="Preview"
                    tw="h-full w-full rounded-[inherit] object-cover"
                />
            </div>

            <div
                tw="absolute right-1 top-2 flex items-center justify-center bg-white text-gray-600 h-8 max-w-full text-3xl rounded-md p-5"
                style={{
                    fontSize: '1.125rem',
                    lineHeight: '1.75rem',
                }}
            >
                {event.price}
            </div>
            <div tw="flex absolute top-50 left-20 rounded-md bg-[#414142] font-medium p-10 max-w-3xl max-h-sm text-xl text-white">
                <h3 tw="inline break-words overflow-hidden">{event.title}</h3>
            </div>
            <div tw="flex absolute bottom-2 left-2 max-w-4xl">
                <div
                    tw="flex flex-row items-center"
                    style={{
                        gap: '0.5rem',
                        fontSize: '1.125rem',
                        lineHeight: '1.75rem',
                    }}
                >
                    <div
                        tw="flex flex-auto text-3xl items-center rounded-md bg-[#414142] p-3 text-white"
                        style={{
                            gap: '0.25rem',
                        }}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            style={{
                                width: '2rem',
                                height: '2rem',
                            }}
                        >
                            <path d="M8 2v4" />
                            <path d="M16 2v4" />
                            <rect width="18" height="18" x="3" y="4" rx="2" />
                            <path d="M3 10h18" />
                        </svg>
                        <span>{event.date}</span>
                    </div>
                    <div tw="flex flex-auto items-center text-3xl rounded-md bg-[#414142] p-3 text-white">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            style={{
                                width: '2rem',
                                height: '2rem',
                            }}
                        >
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                            <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span>{event.locationType}</span>
                    </div>
                    <div tw="flex flex-auto items-center text-3xl rounded-md bg-[#414142] p-3 text-white">
                        {event.hosts.length > 1 ? (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                style={{
                                    width: '2rem',
                                    height: '2rem',
                                }}
                            >
                                <path d="M18 21a8 8 0 0 0-16 0" />
                                <circle cx="10" cy="8" r="5" />
                                <path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3" />
                            </svg>
                        ) : (
                            <svg
                                style={{
                                    width: '2rem',
                                    height: '2rem',
                                }}
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <circle cx="12" cy="8" r="5" />
                                <path d="M20 21a8 8 0 0 0-16 0" />
                            </svg>
                        )}
                        <span>{host}</span>
                    </div>
                </div>
            </div>
        </div>
    )
    const imageResponse = await rendered.arrayBuffer()
    const compressedImgBlob = await compressImage(imageResponse, 256)
    return compressedImgBlob
}

async function compressImage(arrayBuffer: ArrayBuffer, targetSizeKB: number) {
    let imageBuffer = Buffer.from(arrayBuffer)

    let sizeKB = imageBuffer.length / 1024
    console.log(`compressImage >> initial sizeKB: ${sizeKB}`)

    // Iterate until the image size is less than or equal to the target size
    let reducedQuality = 80

    let loop = 0

    while (sizeKB > targetSizeKB) {
        loop++
        console.log('start reducedQuality', reducedQuality)

        if (reducedQuality <= 20) {
            reducedQuality = 2
        }
        console.log('again running reducedQuality', reducedQuality)

        // Resize the image by reducing the quality
        imageBuffer = await sharp(imageBuffer)
            .jpeg({ quality: reducedQuality }) // Adjust quality as needed
            .toBuffer()

        sizeKB = imageBuffer.length / 1024
        console.log(`sizeKB after loop ${loop}: ${sizeKB}`)
        reducedQuality -= 10
        console.log('running')
    }

    console.log(`final reducedQuality after loop ${loop} is`, reducedQuality)

    // Convert the resized image buffer to base64
    const resizedBase64 = imageBuffer.toString('base64')

    // Construct the base64 URL of the resized image
    const resizedBase64Url = `data:image/jpeg;base64,${resizedBase64}`

    return resizedBase64Url
}
