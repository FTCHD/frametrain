import { extractEventDetails } from '@/templates/luma/utils/crawler'
import { generateSocialCard } from '@/templates/luma/utils/fetch-social-image'
import { ImageResponse } from 'next/og'
import type { NextRequest } from 'next/server'
// App router includes @vercel/og.
// No need to install it.

export async function GET(_: NextRequest, { params }: { params: { eventId: string } }) {
    try {
        const eventUrl = 'https://lu.ma/' + params.eventId

        const event = await extractEventDetails(eventUrl)
        if (!event) {
            throw new Error('Event not found')
        }
        const bg = generateSocialCard({
            title: event.title,
            img: event.cover,
        })
        const price = event.price

        const host = event.hosts.length
            ? event.hosts.length === 1
                ? event.hosts[0].name
                : event.hosts
                      .slice(0, 3)
                      .map((h) => h.name)
                      .join(', ')
            : 'UNKNOWN HOST'

        return new ImageResponse(
            <div tw="flex group relative rounded rounded-2xl border border-gray-300">
                <label tw="group relative isolate flex aspect-[1200/630] w-full flex-col items-center justify-center overflow-hidden bg-white transition-all hover:bg-gray-50">
                    <img src={bg} alt="Preview" tw="h-full w-full rounded-[inherit] object-cover" />
                </label>

                <div
                    tw="sm:inline-flex absolute right-2 top-2 group flex items-center justify-center border-gray-200 bg-white text-gray-600 h-8 max-w-full text-lg rounded-md p-2 transition-all"
                    style={{
                        fontSize: '1.125rem',
                        lineHeight: '1.75rem',
                    }}
                >
                    {price}
                </div>
                <div tw="flex absolute bottom-2 left-2 rounded-md bg-[#414142] px-1.5 py-px text-white">
                    <div
                        tw="flex flex-row items-center"
                        style={{
                            gap: '0.5rem',
                            fontSize: '1.125rem',
                            lineHeight: '1.75rem',
                        }}
                    >
                        <div
                            tw="flex items-center text-lg"
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
                                    width: '1rem',
                                    height: '1rem',
                                }}
                            >
                                <path d="M8 2v4" />
                                <path d="M16 2v4" />
                                <rect width="18" height="18" x="3" y="4" rx="2" />
                                <path d="M3 10h18" />
                            </svg>
                            <span>{event.date}</span>
                        </div>
                        <div tw="flex items-center text-lg">
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
                                    width: '1rem',
                                    height: '1rem',
                                }}
                            >
                                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                                <circle cx="12" cy="10" r="3" />
                            </svg>
                            <span>{event.onlineEvent}</span>
                        </div>
                        <div tw="flex items-center text-lg">
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
                                        width: '1rem',
                                        height: '1rem',
                                    }}
                                >
                                    <path d="M18 21a8 8 0 0 0-16 0" />
                                    <circle cx="10" cy="8" r="5" />
                                    <path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3" />
                                </svg>
                            ) : (
                                <svg
                                    style={{
                                        width: '1rem',
                                        height: '1rem',
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
            </div>,
            {
                width: 955,
                height: 500,
            }
        )
    } catch (_) {
        return new ImageResponse(<>Event data not found for event id {params.eventId}</>, {
            width: 955,
            height: 500,
        })
    }
}
