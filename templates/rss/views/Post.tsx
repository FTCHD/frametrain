import type { RssFeed } from '../rss'

export default function PostView({
    post,
    postIndex,
    total,
}: { post: RssFeed['body'][number]; postIndex: number; total: number }) {
    const description = (post?.content || post.description).trim()
    return (
        <div
            style={{
                display: 'flex',
                flexFlow: 'column',
                height: '100%',
                width: '100%',
                color: '#ffffff',
                padding: '15px 20px',
                gap: '15px',
                fontFamily: 'Roboto',
                backgroundColor: 'black',
            }}
        >
            <span
                style={{
                    fontSize: '25px',
                    fontWeight: 900,
                    fontStyle: 'italic',
                    color: '#ffe83f',
                }}
            >
                {post.title}
            </span>
            <div
                style={{
                    width: '100%',
                    display: 'flex',
                    flexGrow: '1',
                    flexDirection: 'column',
                    padding: '15px 20px',
                    borderRadius: '10px',
                    background: 'rgba(0, 0, 0, 0.15)',
                    gap: '10px',
                    overflow: 'hidden',
                }}
            >
                <div
                    style={{
                        width: '100%',
                        display: 'flex',
                        flexGrow: '1',
                        flexDirection: 'column',
                        gap: '10px',
                        top: '40%',
                    }}
                >
                    {description
                        .substring(0, 700)
                        .split('\n\n')
                        .map((line: string) =>
                            line.split('\n').map((line: string) => (
                                <div
                                    key={line}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        width: '100%',
                                        fontWeight: 700,
                                        fontSize: '20px',
                                        lineHeight: '28px',
                                    }}
                                >
                                    {line}
                                </div>
                            ))
                        )}
                </div>

                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        width: '100%',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        opacity: '0.8',
                    }}
                >
                    <div
                        style={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                        }}
                    >
                        {post.pubDate}
                    </div>

                    <div
                        style={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                        }}
                    >
                        {postIndex}/{total}
                    </div>
                </div>
            </div>
        </div>
    )
}
