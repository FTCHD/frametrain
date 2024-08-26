export type TextSlideStyle = {
    color?: string
    position?: 'left' | 'center' | 'right'
    fontSize?: number
    fontWeight?: string
    fontFamily?: string
    fontStyle?: string
}

export type TextSlideProps = {
    title: { text: string } & TextSlideStyle
    subtitle: { text: string } & TextSlideStyle
    bottomMessage?: { text?: string } & TextSlideStyle
    background?: string
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
export default function TextSlide({ title, subtitle, bottomMessage, background }: TextSlideProps) {
    const backgroundProp: Record<string, string> = {}

    if (background) {
        if (background.startsWith('#')) {
            backgroundProp['backgroundColor'] = background
        } else {
            backgroundProp['backgroundImage'] = background
        }
    } else {
        backgroundProp['backgroundColor'] = 'black'
    }

    const alignmentToFlex = (alignment: TextSlideStyle['position']): string => {
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
                    fontFamily: title.fontFamily || 'Roboto',
                    fontSize: `${title.fontFamily || 50}px`,
                    color: title.color || 'white',
                    fontStyle: title.fontStyle || 'normal',
                    fontWeight: title.fontWeight || 'bold',
                    justifyContent: alignmentToFlex(title.position),
                    textWrap: 'balance',
                }}
            >
                {title.text}
            </div>
            <div
                style={{
                    fontFamily: subtitle.fontFamily || 'Roboto',
                    fontSize: `${subtitle.fontFamily || 30}px`,
                    color: subtitle.color || 'white',
                    fontStyle: subtitle.fontStyle || 'medium',
                    fontWeight: subtitle.fontWeight || 'bold',
                    justifyContent: alignmentToFlex(subtitle.position),
                    textWrap: 'balance',
                }}
            >
                {subtitle.text}
            </div>
            {bottomMessage && (
                <div
                    style={{
                        fontFamily: bottomMessage.fontFamily || 'Roboto',
                        fontSize: `${bottomMessage.fontFamily || 20}px`,
                        color: bottomMessage.color || 'white',
                        fontStyle: bottomMessage.fontStyle || 'normal',
                        fontWeight: bottomMessage.fontWeight || 'lighter',
                        justifyContent: alignmentToFlex(bottomMessage.position),
                        textWrap: 'balance',
                        opacity: '0.8',
                    }}
                >
                    {bottomMessage.text}
                </div>
            )}
        </div>
    )
}
