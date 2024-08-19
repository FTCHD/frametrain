import type { Property } from 'csstype'

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

    const alignmentToTextAlign = (
        alignment: TextStyle['alignment']
    ): Property.TextAlign | undefined => {
        switch (alignment) {
            case 'left':
                return 'left'
            case 'right':
                return 'right'
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
                gap: '100px',
                padding: '70px',
                ...backgroundProp,
            }}
        >
            <h3
                style={{
                    fontFamily: titleStyles?.font || 'Roboto',
                    fontSize: titleStyles?.size || '75px',
                    color: titleStyles?.color || 'white',
                    fontStyle: titleStyles?.style || 'normal',
                    fontWeight: titleStyles?.weight || 'bold',
                    justifyContent: alignmentToFlex(titleStyles?.alignment),
                    textAlign: alignmentToTextAlign(titleStyles?.alignment),
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
                        fontStyle: subtitleStyles?.style || 'normal',
                        fontWeight: subtitleStyles?.weight || 'medium',
                        justifyContent: alignmentToFlex(subtitleStyles?.alignment),
                        textAlign: alignmentToTextAlign(subtitleStyles?.alignment),
                        opacity: '0.8',
                    }}
                >
                    {subtitle}
                </span>
            )}

            {customMessage && (
                <span
                    style={{
                        fontFamily: customStyles?.font || 'Roboto',
                        fontSize: customStyles?.size || '30px',
                        color: customStyles?.color || 'white',
                        fontStyle: customStyles?.style || 'normal',
                        fontWeight: customStyles?.weight || 'medium',
                        justifyContent: alignmentToFlex(customStyles?.alignment),
                        textAlign: alignmentToTextAlign(customStyles?.alignment),
                    }}
                >
                    {customMessage}
                </span>
            )}
        </div>
    )
}
