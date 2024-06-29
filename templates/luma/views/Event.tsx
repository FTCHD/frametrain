
import type { Config } from '..'
import AddressIcon from '../icons/Address'
import CalendarIcon from '../icons/Calendar'
import HostIcon from '../icons/Host'
import { formatHosts } from '../utils/alphanum'

type Props = Config & {
    event: NonNullable<Config['event']>
}

export default function EventView(props: Props) {
    const {
        event: { startsAt, endsAt, timezone, ...event },
    } = props
    const host = formatHosts(event.hosts)

    return (
        <>
            <div
                style={{
                    height: '100vh',
                    width: '100vw',
                    display: 'flex',
                    gap: '1rem',
                    backgroundColor: 'black',
                    fontFamily: 'Inter',
                }}
            >
                <img
                    alt="Background"
                    style={{
                        position: 'absolute',
                        filter: 'blur(40px)',
                        objectFit: 'contain',
                    }}
                    src={event.backgroundImage}
                />
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                    }}
                >
                    <div
                        style={{
                            width: '65%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            padding: '40px 50px',
                        }}
                    >
                        <h3
                            style={{
                                color: props.textColor ?? 'white',
                                wordBreak: 'break-word',
                                textAlign: 'left',
                                fontSize: '64px',
                            }}
                        >
                            {event.title}
                        </h3>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                fontSize: '36px',
                                gap: '30px',
                                color: props.infoColor ?? 'white',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    gap: '10px',
                                }}
                            >
                                <HostIcon />
                                <div
                                    style={{
                                        display: 'flex',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {host}
                                </div>
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    gap: '10px',
                                }}
                            >
                                <CalendarIcon />
                                <span>{startsAt}</span>
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    gap: '10px',
                                }}
                            >
                                <AddressIcon />
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
                        {props.customMessage && (
                            <div
                                style={{
                                    color: props.customMessageColor ?? 'white',
                                    textAlign: 'center',
                                }}
                            >
                                {props.customMessage}
                            </div>
                        )}
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            flex: 1,
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '25px',
                        }}
                    >
                        <img
                            src={event.image}
                            alt="Event cover"
                            style={{
                                width: '250px',
                                height: '250px',
                                borderRadius: '2%',
                            }}
                        />
                        <div
                            style={{
                                width: '250px',
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '20px',
                            }}
                        >
                            <div
                                style={{
                                    backgroundColor: props.priceBackgroundColor ?? 'black',
                                    color: props.priceColor ?? 'white',
                                    textAlign: 'center',
                                    padding: '10px',
                                    borderRadius: '8px',
                                }}
                            >
                                {event.price}
                            </div>
                            {event.remainingSpots ? (
                                <span
                                    style={{
                                        backgroundColor: props.priceBackgroundColor ?? 'black',
                                        color: props.priceColor ?? 'white',
                                        textAlign: 'center',
                                        padding: '10px',
                                        borderRadius: '8px',
                                    }}
                                >
                                    {event.remainingSpots} Spot
                                    {event.remainingSpots > 1 && 's'}
                                </span>
                            ) : undefined}
                        </div>
                        {/* {event.approvalRequired ? (
                            <div
                                tw="flex flex-row font-medium items-center"
                                style={{
                                    gap: '0.25rem',
                                }}
                            >
                                <span>Approval Required</span>
                            </div>
                        ) : null} */}
                    </div>
                </div>
            </div>
        </>
    )
}
