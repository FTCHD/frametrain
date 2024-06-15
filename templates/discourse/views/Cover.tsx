export default function CoverView({
    title,
    postCount,
    viewCount,
    backgroundColor,
    highlightColor,
    highlightFont,
}: {
    title?: string
    postCount: number
    viewCount: number
    backgroundColor?: string
    highlightColor?: string
    highlightFont?: string
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

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '100px',
                padding: '70px',
                color: highlightColor || 'white',
                fontFamily: highlightFont || 'Urbanist',
                ...backgroundProp,
            }}
        >
            <span
                style={{
                    fontSize: '100px',
                    textAlign: 'center',
                    textWrap: 'balance',
                    fontWeight: 'bold',
                }}
            >
                {title || 'Title'}
            </span>
            <span
                style={{
                    fontSize: '50px',
                    opacity: '0.8',
                    fontWeight: 'medium',
                }}
            >
                {postCount || 'No'} posts | {viewCount || 'No'} views
            </span>
        </div>
    )
}
