export default function CoverView({
    title,
    subtitle,
    backgroundColor,
    textColor,
}: { title: string; subtitle: string; backgroundColor?: string; textColor?: string }) {
    const backgroundProp = {}

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
                gap: '50px',
                padding: '40px',
                color: textColor || 'white',
                ...backgroundProp,
            }}
        >
            <span
                style={{
                    fontFamily: 'Roboto',
                    fontSize: '48px',
                    textAlign: 'center',
                    textWrap: 'balance',
                }}
            >
                {title ?? 'Title'}
            </span>
            <span
                style={{
                    fontFamily: 'Roboto',
                    fontSize: '24px',
                    opacity: '0.8',
                }}
            >
                {subtitle ?? 'Subtitle'}
            </span>
        </div>
    )
}
