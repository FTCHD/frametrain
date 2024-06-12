export default function ResultsView(question: string, colors: Record<string, string | undefined>) {
    const backgroundProp: Record<string, string> = {}

    if (colors?.background) {
        if (colors.background.startsWith('#')) {
            backgroundProp['backgroundColor'] = colors.background
        } else {
            backgroundProp['backgroundImage'] = colors.background
        }
    } else {
        backgroundProp['backgroundImage'] = 'linear-gradient(to right, #0f0c29, #0b6bcb, #0f0c29)'
    }

    return (
        <div
            style={{
                display: 'flex',
                flexFlow: 'column',
                justifyContent: 'space-around',
                width: '100%',
                height: '100%',
                color: '#ffffff',
                padding: '40px',
                gap: '30px',
                ...backgroundProp,
            }}
        >
            <div
                style={{
                    display: 'flex',
                    fontSize: '70px',
                    fontWeight: 500,
                    color: colors?.textColor || 'white',
                }}
            >
                {question}
            </div>
        </div>
    )
}
