import type { Config } from '..'

export default function CoverView(config: Config) {
    const { background, textColor } = config

    const backgroundProp: Record<string, string> = {}

    if (background) {
        if (background.startsWith('#')) {
            backgroundProp['backgroundColor'] = background
        } else {
            backgroundProp['backgroundImage'] = background
        }
    } else {
        backgroundProp['backgroundColor'] = '#09203f'
    }

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                fontFamily: 'Roboto',
                fontSize: '50px',
                color: '#ffffff',
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
                    background: 'rgba(255, 255, 255, 0.22)',
                    color: textColor || 'white',
                    fontSize: '100px',
                    textAlign: 'center',
                    fontWeight: '900',
                    lineHeight: '1.4',
                    textWrap: 'balance',
                }}
            >
                🎉 Welcome to Quizzlet! Press "START" to being your journey
            </div>
        </div>
    )
}
