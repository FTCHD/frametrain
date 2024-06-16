import type { Config } from '..'

export default function CoverView(config: Config, message: string) {
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
                gap: 50,
                ...backgroundProp,
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
                    fontSize: '40px',
                    color: config.primaryColor || 'white',
                }}
            >
                Scheduling Infrastructure for everyone
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
                        alignSelf: 'flex-end',
                    }}
                >
                    {`@${config.username}`}
                </div>
            </div>
            <div
                style={{
                    color: config.primaryColor || 'white',
                    fontSize: '30px',
                }}
            >
                {message}
            </div>
        </div>
    )
}
