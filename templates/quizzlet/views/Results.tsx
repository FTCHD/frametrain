export default function ResultsView(
    questions: number,
    percentageForEachOption: Record<string, number>,
    choicesForOption: Record<string, number>,
    colors: Record<string, string | undefined>
) {
    console.log('ResultsView >> percentageForEachOption', percentageForEachOption)
    console.log('ResultsView >> choicesForOption', choicesForOption)

    const backgroundProp: Record<string, string> = {}
    const options: { key: string; displayLabel: string; color: string }[] = [
        {
            key: 'correct_answers',
            displayLabel: 'Correct Answers',
            color: 'green',
        },
        {
            key: 'wrong_answers',
            displayLabel: 'Wrong Answers',
            color: 'red',
        },
    ]

    if (colors?.background) {
        if (colors.background.startsWith('#')) {
            backgroundProp['backgroundColor'] = colors.background
        } else {
            backgroundProp['backgroundImage'] = colors.background
        }
    } else {
        backgroundProp['backgroundColor'] = '#09203f'
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
                    color: colors?.textColor || 'white',
                }}
            >
                Your overall results for {questions} questions
            </div>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '30px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.22)',
                    color: colors?.textColor || 'white',
                    gap: '20px',
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
                                ({choicesForOption[option.key] ?? 0})
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
                                width={(300 * percentageForEachOption?.[option.key]) / 100}
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
