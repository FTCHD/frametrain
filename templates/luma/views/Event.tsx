import type { Config } from '..'
import { formatHosts } from '../utils/alphanum'
import { formatDate } from '../utils/dates'

type Props = Config & {
    event: NonNullable<Config['event']>
}

function SpotsIcon() {
    return (
        <>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                <path
                    fill="currentColor"
                    fill-rule="evenodd"
                    d="M4.57.88a.75.75 0 0 1-.284 1.023 7.9 7.9 0 0 0-2.435 2.13.75.75 0 0 1-1.202-.898A9.4 9.4 0 0 1 3.547.598.75.75 0 0 1 4.569.88m6.693.002a.75.75 0 0 1 1.021-.286 9.3 9.3 0 0 1 2.9 2.539.75.75 0 1 1-1.202.897 7.8 7.8 0 0 0-2.433-2.128.75.75 0 0 1-.286-1.022m3.32 8.035a6.667 6.667 0 1 1-13.333 0 6.667 6.667 0 0 1 13.334 0m-7.304.395a.75.75 0 0 1-.112-.395V5.583a.75.75 0 1 1 1.5 0v3.023l1.447 1.447a.75.75 0 0 1-1.06 1.06l-1.66-1.66a.8.8 0 0 1-.115-.141"
                />
            </svg>
        </>
    )
}
function UserRoundCheck() {
    return (
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
            <path d="M2 21a8 8 0 0 1 13.292-6" />
            <circle cx="10" cy="8" r="5" />
            <path d="m16 19 2 2 4-4" />
        </svg>
    )
}

export default function EventView(props: Props) {
    const {
        event: { startsAt, endsAt, timezone, ...event },
    } = props
    const host = formatHosts(event.hosts)
    const [start, end] = formatDate(timezone, startsAt, endsAt)

    return (
        <>
            <div
                tw={'flex flex-col min-h-screen w-full items-center justify-center'}
                style={{
                    gap: '1rem',
                    color: props.textColor ?? 'text-white',
                }}
            >
                <div
                    tw="absolute w-full opacity-50"
                    style={{
                        backgroundImage: `url(${event.backgroundCover})`,
                        backgroundPosition: 'center',
                        backgroundSize: 'cover',
                        backgroundRepeat: 'no-repeat',
                        filter: 'blur(10px)',
                        height: '100%',
                    }}
                />
                <div
                    tw="flex flex-col w-full h-full justify-center items-center"
                    style={{
                        gap: '1rem',
                    }}
                >
                    <div
                        tw="flex flex-col items-center justify-center"
                        style={{
                            gap: '1rem',
                        }}
                    >
                        <img src={event.image} alt="Event cover" tw="w-48 h-48" />
                        <div
                            tw="flex flex-col px-2 items-center justify-center"
                            style={{
                                gap: '0.25rem',
                                textAlign: 'center',
                            }}
                        >
                            <h3
                                tw="text-xl font-medium inline"
                                style={{
                                    wordBreak: 'break-word',
                                }}
                            >
                                {event.title}
                            </h3>
                            <div
                                tw={`flex flex-col justify-center  items-center ${
                                    !props.infoColor ? 'text-[#ffffff80]' : ''
                                }`}
                                style={{
                                    gap: '1.25rem',
                                    color: props.infoColor,
                                }}
                            >
                                <div
                                    tw="flex flex-col justify-center items-center"
                                    style={{ gap: '.25rem' }}
                                >
                                    <div
                                        tw="flex flex-row items-center min-w-0"
                                        style={{ fontSize: '1rem', gap: '.5rem' }}
                                    >
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
                                        <div
                                            tw="flex flex-inline overflow-hidden"
                                            style={{
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                fontSize: '1rem',
                                            }}
                                        >
                                            By {host}
                                        </div>
                                    </div>
                                    <div tw="flex flex-col">
                                        <div
                                            tw="flex flex-row min-w-0 font-medium"
                                            style={{
                                                fontSize: '1rem',
                                                gap: '.5rem',
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
                                            <span>{start}</span>
                                        </div>
                                        {end && (
                                            <div
                                                tw="flex flex-row min-w-0 ml-6 font-medium"
                                                style={{
                                                    fontSize: '1rem',
                                                }}
                                            >
                                                <span>{end}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div
                                        tw="flex flex-row justify-center items-center font-medium"
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
                                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                                            <circle cx="12" cy="10" r="3" />
                                        </svg>
                                        <span
                                            style={{
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {event.address}
                                        </span>
                                    </div>
                                </div>
                                {event.remainingSpots || event.approvalRequired ? (
                                    <div
                                        tw="flex flex-col items-center justify-center"
                                        style={{
                                            gap: '.25rem',
                                        }}
                                    >
                                        {event.remainingSpots ? (
                                            <div
                                                tw="flex flex-row items-center font-medium"
                                                style={{
                                                    gap: '0.25rem',
                                                }}
                                            >
                                                <SpotsIcon />
                                                <span>
                                                    {event.remainingSpots} spot
                                                    {event.remainingSpots > 1 && 's'} left
                                                </span>
                                            </div>
                                        ) : (
                                            <></>
                                        )}
                                        {event.approvalRequired ? (
                                            <div
                                                tw="flex flex-row justify-center items-center font-medium"
                                                style={{
                                                    gap: '0.25rem',
                                                }}
                                            >
                                                <UserRoundCheck />
                                                <span>Approval Required</span>
                                            </div>
                                        ) : (
                                            <></>
                                        )}
                                    </div>
                                ) : (
                                    <></>
                                )}
                            </div>
                        </div>
                    </div>
                    <div
                        tw={`flex items-center justify-center bg-[${
                            props.priceBackgroundColor ?? '#414142'
                        }] text-${
                            props.priceColor ? `[${props.priceColor}]` : 'gray-600'
                        } h-8 max-w-full text-3xl rounded-[100px] p-5`}
                        style={{
                            fontSize: '1.125rem',
                            lineHeight: '1.75rem',
                            gap: '.5rem',
                        }}
                    >
                        {event.price}
                    </div>
                </div>
            </div>
        </>
    )
}
