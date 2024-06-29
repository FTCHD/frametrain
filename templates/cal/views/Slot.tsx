import type { Config } from '..'

export default function CoverView(config: Config, slots: string[], slotParam: number) {
    const backgroundProp: Record<string, string> = {}
    if (config.background) {
        if (config.background?.startsWith('#')) {
            backgroundProp['backgroundColor'] = config.background
        } else {
            backgroundProp['backgroundImage'] = config.background
        }
    } else {
        backgroundProp['backgroundColor'] = '#black'
    }

    const visibleIndex = Math.floor(Number.parseInt(slotParam.toString()) / 10)
    const startIndex = visibleIndex * 10
    const endIndex = Math.min(startIndex + 10, slots.length)
    const visibleTimeSlots = slots.slice(startIndex, endIndex)

    const firstRowSlots = visibleTimeSlots.slice(0, 5)
    const secondRowSlots = visibleTimeSlots.slice(5, 10)

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'center',
                fontFamily: config.fontFamily || 'Roboto',
                fontSize: '50px',
                color: config.primaryColor || 'white',
                padding: 50,
                gap: 30,
                ...backgroundProp,
            }}
        >
            <div
                style={{
                    display: 'flex',
                    width: '100%',
                    padding: 20,
                    alignItems: 'center',
                    gap: 30,
                }}
            >
                <img
                    src={config.image}
                    alt=""
                    style={{
                        width: 150,
                        height: 150,
                        borderRadius: '50%',
                        border: '5px solid ',
                        borderColor: config.primaryColor || 'white',
                    }}
                />
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                    }}
                >
                    <div
                        style={{
                            fontSize: '70px',
                            fontWeight: config.titleWeight || 'bold',
                            fontFamily: config.fontFamily || 'Roboto',
                            color: config.primaryColor || 'white',
                            fontStyle: config.titleStyle || 'normal',
                        }}
                    >
                        {config.name}
                    </div>
                    <div
                        style={{
                            fontSize: '30px',
                            fontWeight: config.titleWeight || 'normal',
                            fontFamily: config.fontFamily || 'Roboto',
                            color: config.secondaryColor || 'grey',
                            fontStyle: config.titleStyle || 'normal',
                        }}
                    >
                        {`@${config.username}`}
                    </div>
                </div>
            </div>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                }}
            >
                <div
                    style={{
                        color: config.primaryColor || 'white',
                        display: 'flex',
                        fontSize: 36,
                    }}
                >
                    Choose a slot
                </div>
                <div
                    style={{
                        color: config.primaryColor || 'white',
                        display: 'flex',
                        fontSize: 28,
                    }}
                >
                    Timezone: UTC
                </div>
            </div>

            <div
                style={{
                    color: config.primaryColor || 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 10,
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        width: '100%',
                    }}
                >
                    {firstRowSlots.length !== 0 &&
                        firstRowSlots.map((timeSlot, index) => (
                            <div
                                key={index}
                                style={{
                                    fontSize: 30,
                                    padding: 15,
                                    paddingLeft: 20,
                                    backgroundColor:
                                        index === slotParam % 5 && slotParam % 10 < 5
                                            ? config.primaryColor || 'white'
                                            : 'none',
                                    color:
                                        index === slotParam % 5 && slotParam % 10 < 5
                                            ? config.secondaryColor || 'black'
                                            : config.primaryColor || 'white',
                                    border:
                                        index === slotParam % 5 && slotParam % 10 < 5
                                            ? 'none'
                                            : '1px solid gray',
                                    borderRadius: 15,
                                }}
                            >
                                {timeSlot}
                            </div>
                        ))}
                </div>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        width: '100%',
                    }}
                >
                    {secondRowSlots.length !== 0 &&
                        secondRowSlots.map((timeSlot, index) => (
                            <div
                                key={index}
                                style={{
                                    fontSize: 30,
                                    padding: 15,
                                    paddingLeft: 20,
                                    backgroundColor:
                                        index + 5 === slotParam % 10
                                            ? config.primaryColor || 'white'
                                            : 'none',
                                    color:
                                        index + 5 === slotParam % 10
                                            ? config.secondaryColor || 'black'
                                            : config.primaryColor || 'white',
                                    border:
                                        index + 5 === slotParam % 10 ? 'none' : '1px solid gray',
                                    borderRadius: 15,
                                }}
                            >
                                {timeSlot}
                            </div>
                        ))}
                </div>
            </div>
        </div>
    )
}
