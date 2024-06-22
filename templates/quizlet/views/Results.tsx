import type { Config } from '..'

export default function ResultsView(
    questions: number,
    scores: Record<string, number>,
    config: Config
) {
    const backgroundProp: Record<string, string> = {}
    const labelBackgroundProp: Record<string, string> = {}

    const options: { key: string; displayLabel: string; color: string }[] = [
        {
            key: 'yes',
            displayLabel: config.results.yesLabel,
            color: config.results.yesBarColor,
        },
        {
            key: 'no',
            displayLabel: config.results.noLabel,
            color: config.results.noBarColor,
        },
    ]

    const percentages = Object.fromEntries(
        Object.entries(scores).map(([key, value]) => [key, (value / questions) * 100]) as [
            string,
            number,
        ][]
    ) as Record<string, number>

    if (config.results.background) {
        if (config.results.background.startsWith('#')) {
            backgroundProp['backgroundColor'] = config.results.background
        } else {
            backgroundProp['backgroundImage'] = config.results.background
        }
    } else {
        backgroundProp['backgroundColor'] = '#09203f'
    }

    if (config.results.labelBackground) {
        if (config.results.labelBackground.startsWith('#')) {
            labelBackgroundProp['backgroundColor'] = config.results.labelBackground
        } else {
            labelBackgroundProp['backgroundImage'] = config.results.labelBackground
        }
    } else {
        labelBackgroundProp['backgroundColor'] = 'rgba(255, 255, 255, 0.22)'
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
                    fontSize: '50px',
                    fontWeight: 500,
                    textAlign: 'center',
                    alignItems: 'center',
                    color: 'white',
                }}
            >
                Your grade for this quiz is {Math.round(percentages.yes).toFixed(0)}% out of{' '}
                {questions} questions.
            </div>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '30px',
                    borderRadius: '10px',
                    color: 'white',
                    gap: '20px',
                    ...labelBackgroundProp,
                }}
            >
                {options.map((option) => (
                    <div
                        key={option.key}
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            width: '100%',
                        }}
                    >
                        <span
                            style={{
                                fontFamily: 'Roboto',
                                fontSize: '80px',
                                fontWeight: 600,
                            }}
                        >
                            {option.displayLabel}
                            <span
                                style={{
                                    fontFamily: 'Roboto',
                                    fontSize: '20px',
                                    fontWeight: 900,
                                    color: 'rgba(255, 255, 255, 0.6)',
                                    paddingLeft: '5px',
                                }}
                            >
                                ({scores[option.key] ?? 0})
                            </span>
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
                                width={(300 * percentages[option.key]) / 100}
                                height="30"
                                rx="15"
                                ry="15"
                                fill={option.color}
                            />
                        </svg>
                    </div>
                ))}
            </div>
        </div>
    )
}
