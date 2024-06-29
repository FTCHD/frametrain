import type { Config } from '..'

export default function CoverView(config: Config) {
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
                justifyContent: 'space-between',
                fontSize: '50px',
                color: config.primaryColor || 'white',
                padding: 50,
                gap: 40,
                ...backgroundProp,
            }}
        >
            <div
                style={{
                    display: 'flex',
                    // justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 30,
                }}
            >
                <img
                    src={config.image}
                    alt="image-profile"
                    width={250}
                    height={250}
                    style={{
                        width: 250,
                        height: 250,
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
                            fontSize: '100px',
                            fontWeight: config.titleWeight || 'bold',
                            fontFamily: config.fontFamily || 'Roboto',
                            color: config.primaryColor || 'white',
                            fontStyle: config.titleStyle || 'normal',
                            display: 'flex',
                        }}
                    >
                        {`${config.name}`}
                    </div>
                    <div
                        style={{
                            fontSize: '40px',
                            fontWeight: config.titleWeight || 'normal',
                            fontFamily: config.fontFamily || 'Roboto',
                            color: config.secondaryColor || 'grey',
                            fontStyle: config.titleStyle || 'normal',
                            display: 'flex',
                        }}
                    >
                        {`@${config.username}`}
                    </div>
                </div>
            </div>
            <div
                style={{
                    color: config.primaryColor || 'white',
                    fontSize: '32px',
                    marginTop: '50px',
                    alignSelf: 'flex-start',
                    textAlign: 'left',
                }}
            >
                You have successfull booked the slot.Check your email for more info.
            </div>
        </div>
    )
}
