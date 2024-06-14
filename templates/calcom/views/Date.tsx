import type { Config } from '..'
import { months } from '../utils/const'

export default function CoverView(
    config: Config,
    duration: number,
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
                    Choose a date
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
                        alignSelf: 'center',
                    }}
                >
                    {months[Number.parseInt(dates[dateParam].split('-')[1])]}
                </div>

                <div
                    style={{
                        color: config.primaryColor || 'white',
                        display: 'flex',
                        gap: 20,
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: 20,
                    }}
                >
                    {dates.map((date, index) => (
                        <div
                            key={index}
                            style={{
                                padding: 20,
                                border:
                                    index.toString() === dateParam.toString()
                                        ? 'none'
                                        : '1px solid gray',
                                borderRadius: 15,
                                backgroundColor:
                                    index.toString() === dateParam.toString()
                                        ? config.primaryColor || 'white'
                                        : 'none',
                                color:
                                    index.toString() === dateParam.toString()
                                        ? config.secondaryColor || 'black'
                                        : config.primaryColor || 'white',
                            }}
                        >
                            {`${date.split('-')[2]}`}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
