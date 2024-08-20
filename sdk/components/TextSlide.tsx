type TextStyle = {
    color?: string
    alignment?: 'left' | 'center' | 'right'
    size?: number
    weight?: string
    font?: string
    style?: string
}

export type TextSlideProps = {
    title: string
    subtitle: string
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

    const alignmentToFlex = (alignment: TextStyle['alignment']): string => {
        switch (alignment) {
            case 'left':
                return 'flex-start'
            case 'right':
                return 'flex-end'
            default:
                return 'center'
        }
    }

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '150px 20px',
                gap: '70px',
                ...backgroundProp,
            }}
        >
            <div
                style={{
                    fontFamily: titleStyles?.font || 'Roboto',
                    fontSize: `${titleStyles?.size || 50}px`,
                    color: titleStyles?.color || 'white',
                    fontStyle: titleStyles?.style || 'normal',
                    fontWeight: titleStyles?.weight || 'bold',
                    justifyContent: alignmentToFlex(titleStyles?.alignment),
                    textWrap: 'balance',
                }}
            >
                {title}
            </div>
            <div
                style={{
                    color: subtitleStyles?.color || 'white',
                    fontFamily: subtitleStyles?.font || 'Roboto',
                    fontSize: `${subtitleStyles?.size || 30}px`,
                    fontStyle: subtitleStyles?.style || 'normal',
                    fontWeight: subtitleStyles?.weight || 'medium',
                    justifyContent: alignmentToFlex(subtitleStyles?.alignment),
                    opacity: '0.8',
                    textWrap: 'balance',
                }}
            >
                {subtitle}
            </div>
            {customMessage && (
                <div
                    style={{
                        fontFamily: customStyles?.font || 'Roboto',
                        fontSize: `${customStyles?.size || 20}px`,
                        color: customStyles?.color || 'white',
                        fontStyle: customStyles?.style || 'normal',
                        fontWeight: customStyles?.weight || 'medium',
                        justifyContent: alignmentToFlex(customStyles?.alignment),
                    }}
                >
                    {customMessage}
                </div>
            )}
        </div>
    )
}
