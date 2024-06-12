import type { Config as BaseConfig } from '..'

type Config = Omit<BaseConfig, 'qna'> & {
    qna: BaseConfig['qna'][number]
    qnas: BaseConfig['qna']
}

export default function AnswerView(config: Config) {
    const { qna, background, textColor, qnas } = config

    const backgroundProp: Record<string, string> = {}

    if (background) {
        if (background.startsWith('#')) {
            backgroundProp['backgroundColor'] = background
        } else {
            backgroundProp['backgroundImage'] = background
        }
    } else {
        backgroundProp['backgroundImage'] = 'linear-gradient(to right, #0f0c29, #0b6bcb, #0f0c29)'
    }
    const question = qna.question.toUpperCase()
    const paragraphs = question.split('\n')
    const percentage = (qna.index / qnas.length) * 100

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'center',
                // textAlign: 'center',
                // fontFamily: 'Roboto',
                // fontSize: '50px',
                color: '#ffffff',
                padding: '30px',
                paddingBottom: '0px',
                ...backgroundProp,
            }}
        >
            <div
                style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '10px',
                    padding: '20px',
                }}
            >
                {paragraphs.map((p) => (
                    <p
                        key={p}
                        style={{
                            width: '100%',
                            fontFamily: 'Roboto',
                            color: textColor || 'white',
                            fontSize: '25px',
                            fontWeight: 500,
                            lineHeight: '1.4',
                            textWrap: 'balance',
                            overflowWrap: 'break-word',
                            wordWrap: 'break-word',
                        }}
                    >
                        {p}
                    </p>
                ))}
            </div>

            <div
                style={{
                    // minHeight: '15%',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    fontWeight: 600,
                    gap: '20px',
                    color: 'white',
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span>
                        {qna.index}/{qnas.length}
                    </span>
                    <svg width="300" height="30">
                        <rect
                            x="0"
                            y="0"
                            width="300"
                            height="30"
                            rx="15"
                            ry="15"
                            fill="#e0e0e070" // 70% opacity
                        />
                        <rect
                            id="progressBar"
                            x="0"
                            y="0"
                            width={(300 * percentage) / 100}
                            height="30"
                            rx="15"
                            ry="15"
                            // fill={colors?.barColor || 'yellow'}
                            fill={'yellow'}
                        />
                    </svg>
                </div>
            </div>
        </div>
    )
}
