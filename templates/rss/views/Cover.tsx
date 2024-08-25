import type { Config } from '..'
import type { RssFeed } from '../common'

export default function CoverView({ info, config }: { info: RssFeed | null; config: Config }) {
    const backgroundProp: Record<string, string> = {}

    if (config.coverBackground) {
        if (config.coverBackground.startsWith('#')) {
            backgroundProp['backgroundColor'] = config.coverBackground
        } else {
            backgroundProp['backgroundImage'] = config.coverBackground
        }
    } else {
        backgroundProp['backgroundImage'] = 'linear-gradient(to right, #0f0c29, #0b6bcb, #0f0c29)'
    }

    if (info) {
        return (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'black',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    fontSize: '20px',
                    gap: '100px',
                    padding: '70px',
                    fontFamily: config.fontFamily || 'Roboto',
                    color: config.primaryColor || '#ffffff',
                    ...backgroundProp,
                }}
            >
                <h3
                    style={{
                        fontSize: '75px',
                        textWrap: 'balance',
                        fontWeight: 'bold',
                    }}
                >
                    {info.title}
                </h3>
                <span
                    style={{
                        fontSize: '50px',
                        opacity: '0.8',
                        fontWeight: 'medium',
                    }}
                >
                    Recent posts: {info.posts.length}
                </span>
                <span
                    style={{
                        fontSize: '30px',
                        opacity: '0.8',
                        fontWeight: 'medium',

                        color: config.secondaryColor || '#ffffff',
                    }}
                >
                    Last updated: {info.lastUpdated.human}
                </span>
            </div>
        )
    }

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                fontSize: '50px',
                fontFamily: config.fontFamily || 'Roboto',
                color: config.primaryColor || '#ffffff',
                ...backgroundProp,
            }}
        >
            Add an RSS feed URL to get started
        </div>
    )
}
