

export default function PostView({
    post,
    postCount,
    postNumber,
    backgroundColor,
    textFont,
    textColor,
    highlightFont,
    highlightColor,
}: {
    post: Record<string, any>
    postCount: number
    postNumber: number
    backgroundColor?: string
    textFont?: string
    textColor?: string
    highlightFont?: string
    highlightColor?: string
}) {
    const backgroundProp: Record<string, string> = {}

    if (backgroundColor) {
        if (backgroundColor.startsWith('#')) {
            backgroundProp['backgroundColor'] = backgroundColor
        } else {
            backgroundProp['backgroundImage'] = backgroundColor
        }
    } else {
        backgroundProp['backgroundColor'] = 'black'
    }

    const rawPost = post.raw
    let cleanedPost = rawPost

    const startIndex = rawPost.indexOf('[quote')

    if (startIndex !== -1) {
        const quote = rawPost.substring(startIndex, rawPost.indexOf('[/quote]') + 8)
        cleanedPost = cleanedPost.replace(quote, '')
    }

    cleanedPost = cleanedPost.trim()

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
                fontFamily: textFont || 'Lato',
                ...backgroundProp,
            }}
        >
            <span
                style={{
                    fontFamily: highlightFont || 'Urbanist',
                    fontSize: '25px',
                    fontWeight: 900,
                    fontStyle: 'italic',
                    color: highlightColor || 'orange',
                }}
            >
                {post.name || post.username} says...
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
                    color: textColor || 'white',
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
                    }}
                >
                    {cleanedPost
                        .substring(0, 700)
                        .split('\n\n')
                        .map((line: string) =>
                            line.split('\n').map((line: string) => (
                                <div key={line} style={textLineStyle}>
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
                        fontFamily: highlightFont || 'Urbanist',
                        color: highlightColor || 'orange',
                    }}
                >
                    <div
                        style={{
                            width: '100%',
                            display: 'flex',
                        }}
                    >
                        {post?.reply_to_user ? `Replied to ${post.reply_to_user.name}` : ''}
                    </div>

                    <div
                        style={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                        }}
                    >
                        {new Date(post.created_at).toLocaleDateString('en-US')}
                        {' @ '}
                        {new Date(post.created_at).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: 'numeric',
                            hour12: false,
                        })}
                    </div>

                    <div
                        style={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'flex-end',
                        }}
                    >
                        {postNumber}/{postCount}
                    </div>
                </div>
            </div>
        </div>
    )
}

const textLineStyle = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    fontWeight: 700,
    fontSize: '20px',
    lineHeight: '28px',
} as const