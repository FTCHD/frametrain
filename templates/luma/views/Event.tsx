import type { EventDetails } from '../types'
import { generateSocialCard } from '../utils'

export default function EventView(event: EventDetails | null) {
    if (!event) {
        return <div tw="text-center">Event Not Found</div>
    }

    const bg = generateSocialCard({
        title: event.title,
        img: event.cover,
    })
    const price = event.eventPaymentType === 'FREE' ? 'Free' : event.price

    const host = event.hosts.length
        ? event.hosts.length > 0
            ? event.hosts[0].name
            : event.hosts.map((h) => h.name).join(', ')
        : 'UNKNOWN HOST'

    return (
        <div tw="flex group relative overflow-hidden rounded-2xl border border-gray-300">
            <label tw="group relative isolate flex aspect-[1200/630] w-full flex-col items-center justify-center overflow-hidden bg-white transition-all hover:bg-gray-50">
                <img src={bg} alt="Preview" tw="h-full w-full rounded-[inherit] object-cover" />
            </label>

            <div tw="sm:inline-flex absolute right-2 top-2 group flex items-center justify-center border-gray-200 bg-white text-gray-600 h-8 max-w-full text-lg rounded-md p-2 transition-all hover:bg-gray-100">
                {price}
            </div>
            <div tw="flex absolute bottom-2 left-2 rounded-md bg-[#414142] px-1.5 py-px text-white">
                <div tw="flex flex-row items-center gap-4">
                    <div tw="flex items-center gap-4 text-lg">
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
                    <div tw="flex items-center gap-2 text-lg">
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
                    <div tw="flex items-center gap-2 text-lg">
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
                                <circle cx="12" cy="8" r="5" />
                                <path d="M20 21a8 8 0 0 0-16 0" />
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
        </div>
    )
}
