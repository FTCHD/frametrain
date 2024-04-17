export default function VoteView(config: Record<string, string>) {
    const { question, background, textColor } = config

    const backgroundProp = {}

    if (background) {
        if (background.startsWith('#')) {
            backgroundProp['backgroundColor'] = background
        } else {
            backgroundProp['backgroundImage'] = background
        }
    } else {
        backgroundProp['backgroundImage'] = 'linear-gradient(to right, #0f0c29, #0b6bcb, #0f0c29)'
    }

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                height: '100%',
                ...backgroundProp,
            }}
        >
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '30px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: textColor || 'white',
                    fontSize: '64px',
                    fontWeight: '900',
                    lineHeight: '1.5',
                    textWrap: 'balance',
                }}
            >
                {question.toUpperCase()}
            </div>
        </div>
    )
}
