import type { Config } from '..'
import { getTimezoneOffset, months } from '../utils/date'

export default function MonthView(config: Config, monthIndex: number, mins: string) {
    const backgroundProp: Record<string, string> = {}
    if (config.background) {
        if (config.background?.startsWith('#')) {
            backgroundProp['backgroundColor'] = config.background
        } else {
            backgroundProp['backgroundImage'] = config.background
        }
    } else {
        backgroundProp['backgroundColor'] = 'black'
    }

    const monthArray = Object.values(months)
    const visibleIndex = Math.floor(Number.parseInt(monthIndex.toString()) / 8)
    const startIndex = visibleIndex * 8
    const endIndex = Math.min(startIndex + 8, monthArray.length)
    const visibleMonths = monthArray.slice(startIndex, endIndex)

    const firstRowDates = visibleMonths.slice(0, 4)
    const secondRowDates = visibleMonths.slice(4, 8)
    const timezone = getTimezoneOffset(config.timezone || 'Europe/London')

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
                        display: 'flex',
                        alignSelf: 'center',
                        fontSize: 28,
                    }}
                >
                    {new Date().getFullYear()}
                </div>
                <div
                    style={{
                        display: 'flex',
                        fontSize: 28,
                    }}
                >
                    {mins}
                </div>

                <div
                    style={{
                        color: config.primaryColor || 'white',
                        display: 'flex',
                        fontSize: 28,
                    }}
                >
                    GMT{timezone}
                </div>
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
                        firstRowDates.map((month, index) => (
                            <div
                                key={index}
                                style={{
                                    fontSize: 44,
                                    padding: 20,
                                    paddingLeft: 25,
                                    backgroundColor:
                                        index === monthIndex % 4 && monthIndex % 8 < 4
                                            ? config.primaryColor || 'white'
                                            : 'none',
                                    color:
                                        index === monthIndex % 4 && monthIndex % 8 < 4
                                            ? config.secondaryColor || 'black'
                                            : config.primaryColor || 'white',
                                    border:
                                        index === monthIndex % 4 && monthIndex % 8 < 4
                                            ? 'none'
                                            : '1px solid gray',
                                    borderRadius: 15,
                                }}
                            >
                                {month}
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
                        secondRowDates.map((month, index) => (
                            <div
                                key={index}
                                style={{
                                    fontSize: 44,
                                    padding: 20,
                                    paddingLeft: 25,
                                    backgroundColor:
                                        index + 4 === monthIndex % 8
                                            ? config.primaryColor || 'white'
                                            : 'none',
                                    color:
                                        index + 4 === monthIndex % 8
                                            ? config.secondaryColor || 'black'
                                            : config.primaryColor || 'white',
                                    border:
                                        index + 4 === monthIndex % 8 ? 'none' : '1px solid gray',
                                    borderRadius: 15,
                                }}
                            >
                                {month}
                            </div>
                        ))}
                </div>
            </div>
        </div>
    )
}
