type TextStyle = {
    color?: string
    alignment?: 'left' | 'center' | 'right'
    size?: string
    weight?: string
    font?: string
    style?: string
}

export type TextSlideProps = {
    title: string
    subtitle?: string
    customMessage?: string
    titleStyles?: TextStyle
    subtitleStyles?: TextStyle
    customStyles?: TextStyle
    backgroundColor?: string
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
export default function TextSlide({
    title,
    subtitle,
    customMessage,
    titleStyles,
    subtitleStyles,
    customStyles,
    backgroundColor,
}: TextSlideProps) {
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
                gap: '100px',
                padding: '70px',
                ...backgroundProp,
            }}
        >
            <h3
                style={{
                    color: titleStyles?.color || 'white',
                    fontFamily: titleStyles?.font || 'Roboto',
                    fontSize: titleStyles?.size || '75px',
                    textAlign: titleStyles?.alignment || 'center',
                    fontStyle: titleStyles?.style || 'normal',
                    fontWeight: titleStyles?.weight || 'bold',
                    textWrap: 'balance',
                }}
            >
                {title}
            </h3>
            {subtitle && (
                <span
                    style={{
                        color: subtitleStyles?.color || 'white',
                        fontFamily: subtitleStyles?.font || 'Roboto',
                        fontSize: subtitleStyles?.size || '50px',
                        textAlign: subtitleStyles?.alignment || 'center',
                        fontStyle: subtitleStyles?.style || 'normal',
                        fontWeight: subtitleStyles?.weight || 'medium',
                        opacity: '0.8',
                    }}
                >
                    {subtitle}
                </span>
            )}
            {customMessage && (
                <span
                    style={{
                        color: customStyles?.color || 'white',
                        fontFamily: customStyles?.font || 'Roboto',
                        fontSize: customStyles?.size || '30px',
                        textAlign: customStyles?.alignment || 'center',
                        fontStyle: customStyles?.style || 'normal',
                        fontWeight: customStyles?.weight || 'medium',
                    }}
                >
                    {customMessage}
                </span>
            )}
        </div>
    )
}
