import type { RssFeedIntro } from '../rss'

export default function CoverView(info: RssFeedIntro | null) {
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
                    fontFamily: 'Roboto',
                    fontSize: '20px',
                    color: '#ffffff',
                    gap: '100px',
                    padding: '70px',
                }}
            >
                <h3
                    style={{
                        fontSize: '75px',
                        textWrap: 'balance',
                        fontWeight: 'bold',
                    }}
                >
                    {info.title} RSS Feed
                </h3>
                <span
                    style={{
                        fontSize: '50px',
                        opacity: '0.8',
                        fontWeight: 'medium',
                    }}
                >
                    Recent posts: {info.total}
                </span>
                <span
                    style={{
                        fontSize: '30px',
                        opacity: '0.8',
                        fontWeight: 'medium',
                    }}
                >
                    Last updated: {info.updatedAt}
                </span>
            </div>
        )
    }

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                backgroundColor: 'black',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                fontFamily: 'Roboto',
                fontSize: '50px',
                color: '#ffffff',
            }}
        >
            Add an RSS feed URL to get started
        </div>
    )
}
