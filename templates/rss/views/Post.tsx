import type { Config } from '..'
import type { RssFeed } from '../common'

type Props = {
    post: RssFeed['posts'][number]
    postIndex: number
    total: number
    config: Config
}

export default function PostView({ post, postIndex, total, config }: Props) {
    const backgroundProp: Record<string, string> = {}

    if (config.pageBackground) {
        if (config.pageBackground.startsWith('#')) {
            backgroundProp['backgroundColor'] = config.pageBackground
        } else {
            backgroundProp['backgroundImage'] = config.pageBackground
        }
    } else {
        backgroundProp['backgroundImage'] = 'linear-gradient(to right, #0f0c29, #0b6bcb, #0f0c29)'
    }

    const description = (post?.content || post.description || '').trim()

    return (
        <div
            style={{
                display: 'flex',
                flexFlow: 'column',
                height: '100%',
                width: '100%',
                padding: '15px 20px',
                gap: '15px',
                fontFamily: config.fontFamily || 'Roboto',
                color: config.primaryColor || '#ffffff',
                ...backgroundProp,
            }}
        >
            <span
                style={{
                    fontSize: '25px',
                    fontWeight: 900,
                    fontStyle: 'italic',
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
                    gap: '30px',
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
                        // top: '30%',
                    }}
                >
                    {description
                        .substring(0, 700)
                        .split('\n\n')
                        .map((line, index) =>
                            line.split('\n').map((subLine, subIndex) => (
                                <div
                                    key={`${index}-${subIndex}`}
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
                                    {subLine}
                                </div>
                            ))
                        )}
                </div>

                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        width: '100%',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        opacity: '0.8',
                        color: config.secondaryColor || '#ffffff',
                    }}
                >
                    <div>{post.pubDate}</div>

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
