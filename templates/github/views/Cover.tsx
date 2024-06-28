import type { Config } from '..'
import pull from '../assets/pull.png'

export default function CoverView(config: Config) {
    const backgroundProp: Record<string, string> = {}

    if (config.background) {
        if (config.background?.startsWith('#')) {
            backgroundProp['backgroundColor'] = config.background
        }
    } else {
        backgroundProp['backgroundColor'] = '#000000'
    }
    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                padding: '20px',
                display: 'flex',

                color: 'white',
                flexDirection: 'column',
                ...backgroundProp,
            }}
        >
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    fontFamily: config.fontFamily || 'sans-serif',
                    fontSize: '50px',
                    color: config.titleColor || '#08F720',
                    fontWeight: config.titleWeight || 'bold',
                    fontStyle: config.titleStyle || 'normal',
                }}
            >
                {config.name}'s Github Stats
            </div>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '40px',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            gap: '10px',
                            fontSize: '30px',
                            fontWeight: 'bold',
                            alignItems: 'center',
                        }}
                    >
                        <img src={`${process.env.NEXT_PUBLIC_HOST}/repo.png`} width={32} alt="" />
                        <div
                            style={{
                                width: '280px',
                                paddingLeft: '20px',
                                color: config.bodyColor || 'white',
                            }}
                        >
                            Total Repository
                        </div>
                        <div
                            style={{
                                fontSize: '30px',
                                display: 'flex',
                                color: config.bodyColor || 'white',
                            }}
                        >
                            {config.repo}
                        </div>
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            gap: '10px',
                            fontSize: '30px',
                            fontWeight: 'bold',
                            alignItems: 'center',
                        }}
                    >
                        <img
                            src={`${process.env.NEXT_PUBLIC_HOST}/commits.png`}
                            width={32}
                            alt=""
                        />
                        <div
                            style={{
                                width: '280px',
                                paddingLeft: '20px',
                                color: config.bodyColor || 'white',
                            }}
                        >
                            Total commits
                        </div>
                        <div
                            style={{
                                fontSize: '30px',
                                display: 'flex',
                                color: config.bodyColor || 'white',
                            }}
                        >
                            {config.commits}
                        </div>
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            gap: '10px',
                            fontSize: '30px',
                            fontWeight: 'bold',
                            alignItems: 'center',
                        }}
                    >
                        <img src={`${process.env.NEXT_PUBLIC_HOST}/pull.png`} width={32} alt="" />
                        <div
                            style={{
                                width: '280px',
                                paddingLeft: '20px',
                                color: config.bodyColor || 'white',
                            }}
                        >
                            Total PRs
                        </div>
                        <div
                            style={{
                                fontSize: '30px',
                                display: 'flex',
                                color: config.bodyColor || 'white',
                            }}
                        >
                            {config.pr}
                        </div>
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            gap: '10px',
                            fontSize: '30px',
                            fontWeight: 'bold',
                            alignItems: 'center',
                        }}
                    >
                        <img src={`${process.env.NEXT_PUBLIC_HOST}/issue.png`} width={32} alt="" />
                        <div
                            style={{
                                width: '280px',
                                paddingLeft: '20px',
                                color: config.bodyColor || 'white',
                            }}
                        >
                            Total Issues
                        </div>
                        <div
                            style={{
                                fontSize: '30px',
                                display: 'flex',
                                color: config.bodyColor || 'white',
                            }}
                        >
                            {config.issues}
                        </div>
                    </div>
                </div>
                <div
                    style={{
                        display: 'flex',
                    }}
                >
                    <img
                        src={config.imageUrl}
                        alt=""
                        style={{
                            borderRadius: '50%',
                            width: '200px',
                            border: '2px solid #08F720',
                        }}
                    />
                </div>
            </div>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                }}
            >
                <div
                    style={{
                        fontSize: '30px',
                        fontWeight: 'bold',
                        alignItems: 'center',
                        paddingLeft: '40px',
                        color: config.bodyColor || 'white',
                    }}
                >
                    {`${config.commits} contribution in the last year`}
                </div>
                <img
                    src={`http://ghchart.rshah.org/${config.name}`}
                    alt="2016rshah's Github chart"
                    width={'100%'}
                />
            </div>
        </div>
    )
}
