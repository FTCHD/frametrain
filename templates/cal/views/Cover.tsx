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

    const paragraphs =
        config.bio.length > 2 ? [config.bio[0], config.bio[config.bio.length - 1]] : config.bio

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
                    alignItems: 'center',
                    gap: 30,
                }}
            >
                <img
                    src={config.image || 'https://cal.com/avatar.svg'}
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
                        {config.name || 'Your Name'}
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
                        {`@${config.username || 'your-username'}`}
                    </div>
                </div>
            </div>
            {config.bio.length ? (
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 15,
                        marginBottom: '2rem',
                    }}
                >
                    {paragraphs.map((bio) => (
                        <div
                            style={{
                                overflowWrap: 'break-word',
                                fontSize: '30px',
                                lineHeight: '2.5rem',
                            }}
                            key={bio}
                        >
                            {bio.length > 90 ? bio.slice(0, 90) + '...' : bio}
                        </div>
                    ))}
                </div>
            ) : null}

            {config.gatingOptions.nftGating ? (
                <div
                    style={{
                        fontSize: '30px',
                        color: config.primaryColor || 'white',
                        fontFamily: config.fontFamily || 'Roboto',
                        alignSelf: 'flex-start',
                    }}
                >
                    {`ℹ️ Only ${config.nftOptions.nftName || 'NFT'} holders can book.`}
                </div>
            ) : undefined}
            {config.gatingOptions.karmaGating ? (
                <div
                    style={{
                        fontSize: '30px',
                        color: config.primaryColor || 'white',
                        fontFamily: config.fontFamily || 'Roboto',
                        alignSelf: 'flex-start',
                    }}
                >
                    {'ℹ️ Only 2nd degree connections can book.'}
                </div>
            ) : undefined}
            <div
                style={{
                    color: config.primaryColor || 'white',
                    fontSize: '45px',
                    textAlign: 'left',
                }}
            >
                Schedule a call with me right from this Frame!
            </div>
        </div>
    )
}
