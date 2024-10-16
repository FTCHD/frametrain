export type BasicViewStyle = {
    color?: string
    position?: 'left' | 'center' | 'right'
    fontSize?: number
    fontWeight?: string
    fontFamily?: string
    fontStyle?: string
}

export type BasicViewProps = {
    title: { text: string } & BasicViewStyle
    subtitle: { text: string } & BasicViewStyle
    bottomMessage?: { text?: string } & BasicViewStyle
    background?: string
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
export default function BasicView({ title, subtitle, bottomMessage, background }: BasicViewProps) {
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

    const alignmentToFlex = (alignment: BasicViewStyle['position']): string => {
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
                        opacity: '0.8',
                    }}
                >
                    {bottomMessage.text}
                </div>
            )}
        </div>
    )
}
