export default function ResultsView(
    question: string,
    options: { index: number; buttonLabel: string; displayLabel: string }[],
    totalVotes: number,
    percentageForEachOption: Record<string, number>,
    votesForOption: Record<string, number>,
    colors: Record<string, string | undefined>
) {
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
                        key={option.index}
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
                                ({votesForOption[option.index] ?? 0})
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
                                width={(300 * percentageForEachOption?.[option.index]) / 100}
                                height="30"
                                rx="15"
                                ry="15"
                                fill={colors?.barColor || 'yellow'}
                            />
                        </svg>
                    </div>
                ))}
            </div>
        </div>
    )
}
