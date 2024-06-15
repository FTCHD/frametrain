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
    console.log(slotParam)
    const visibleIndex = Math.floor(Number.parseInt(slotParam.toString()) / 10)
    const startIndex = visibleIndex * 10
    const endIndex = Math.min(startIndex + 10, slots.length)
    const visibleTimeSlots = slots.slice(startIndex, endIndex)

    const firstRowSlots = visibleTimeSlots.slice(0, 5)
    const secondRowSlots = visibleTimeSlots.slice(5, 10)

    console.log(visibleTimeSlots)

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
                padding: 70,
                gap: 30,
                ...backgroundProp,
            }}
        >
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: 20,
                }}
            >
                <div
                    style={{
                        fontSize: '100px',
                        fontWeight: config.titleWeight || 'bold',
                        fontFamily: config.fontFamily || 'Roboto',
                        color: config.primaryColor || 'white',
                        fontStyle: config.titleStyle || 'normal',
                    }}
                >
                    Cal.com
                </div>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                        alignSelf: 'flex-end',
                    }}
                >
                    <div
                        style={{
                            fontSize: '60px',
                            color: config.primaryColor || 'white',
                            fontFamily: config.fontFamily || 'Roboto',
                            fontWeight: 'bold',
                        }}
                    >
                        {config.name}
                    </div>
                    <div
                        style={{
                            fontSize: '25px',
                            color: config.primaryColor || 'white',
                            fontFamily: config.fontFamily || 'Roboto',
                            alignSelf: 'flex-end',
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
                    {`Timezone : ${'UTC'}`}
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
