import type { Config } from '..'
import { months } from '../utils/const'

export default function CoverView(
    config: Config,
    duration: string,
    dates: string[],
    dateParam: number,
    mins: string
) {
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

    const visibleIndex = Math.floor(Number.parseInt(dateParam.toString()) / 12)
    const startIndex = visibleIndex * 12
    const endIndex = Math.min(startIndex + 12, dates.length)
    const visibleDates = dates.slice(startIndex, endIndex)

    const firstRowDates = visibleDates.slice(0, 6)
    const secondRowDates = visibleDates.slice(6, 12)

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
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: 20,
                    alignItems: 'center',
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
                    {`${config.name}`}
                </div>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                        alignItems: 'flex-end',
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
                    {/* <div
                        style={{
                            fontSize: '32px',
                            color: config.primaryColor || 'white',
                            fontFamily: config.fontFamily || 'Roboto',
                            fontWeight: 'normal',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        {`@${config.username}`}
                    </div> */}
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
                    Choose a date
                </div>
                <div
                    style={{
                        display: 'flex',
                        alignSelf: 'center',
                    }}
                >
                    {months[Number.parseInt(dates[dateParam].split('-')[1])]}
                </div>
                <div
                    style={{
                        display: 'flex',
                    }}
                >{`${mins} mins`}</div>
            </div>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 20,
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        width: '100%',
                    }}
                >
                    {firstRowDates.length !== 0 &&
                        firstRowDates.map((timeSlot, index) => (
                            <div
                                key={index}
                                style={{
                                    fontSize: 44,
                                    padding: 20,
                                    paddingLeft: 25,
                                    backgroundColor:
                                        index === dateParam % 6 && dateParam % 12 < 6
                                            ? config.primaryColor || 'white'
                                            : 'none',
                                    color:
                                        index === dateParam % 6 && dateParam % 12 < 6
                                            ? config.secondaryColor || 'black'
                                            : config.primaryColor || 'white',
                                    border:
                                        index === dateParam % 6 && dateParam % 12 < 6
                                            ? 'none'
                                            : '1px solid gray',
                                    borderRadius: 15,
                                }}
                            >
                                {`${timeSlot.split('-')[2]}`}
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
                    {secondRowDates.length !== 0 &&
                        secondRowDates.map((timeSlot, index) => (
                            <div
                                key={index}
                                style={{
                                    fontSize: 44,
                                    padding: 20,
                                    paddingLeft: 25,
                                    backgroundColor:
                                        index + 6 === dateParam % 12
                                            ? config.primaryColor || 'white'
                                            : 'none',
                                    color:
                                        index + 6 === dateParam % 12
                                            ? config.secondaryColor || 'black'
                                            : config.primaryColor || 'white',
                                    border:
                                        index + 6 === dateParam % 12 ? 'none' : '1px solid gray',
                                    borderRadius: 15,
                                }}
                            >
                                {`${timeSlot.split('-')[2]}`}
                            </div>
                        ))}
                </div>
            </div>
        </div>
    )
}
