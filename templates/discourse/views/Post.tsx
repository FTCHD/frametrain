

export default function PostView(post: any) {
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
                fontFamily: 'Lato',
            }}
        >
            <span
                style={{
                    fontFamily: 'Urbanist',
                    fontSize: '25px',
                    fontWeight: 900,
                    fontStyle: 'italic',
                    color: 'orange',
                }}
            >
                {post.name} says...
            </span>
            <div
                style={{
                    width: '100%',
                    display: 'flex',
                    flexGrow: '1',
                    flexDirection: 'column',
                    padding: '15px 20px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.15)',
                    gap: '10px',
                    border: '2px solid #392a3b',
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
                                <div key={line} style={tokenRowStyle}>
                                    {line}
                                </div>
                            ))
                        )}
                </div>
                {post?.reply_to_user ? (
                    <span style={{ fontSize: '10px', fontWeight: 900, color: 'orange' }}>
                        Replied to {post.reply_to_user.name}
                    </span>
                ) : null}
                {/* <span
                    style={{
                        fontSize: '20px',
                        fontWeight: 900,
                        color: 'orange',
                    }}
                >
                    Posted on {new Date(post.created_at).toLocaleTimeString('en-US')}
                </span> */}
            </div>
        </div>
    )
}

const tokenRowStyle = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    fontWeight: 700,
    fontSize: '20px',
    lineHeight: '28px',
} as const