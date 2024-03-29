import { dimensionsForRatio } from '@/lib/constants'

export default function ResultsView(
    question: string,
    options: { index: number; buttonLabel: string; displayLabel: string }[],
    totalVotes: number,
    percentageForEachOption: Record<string, number>,
    votesForOption: Record<string, number>
) {
    return (
        <div
            style={{
                display: 'flex',
                flexFlow: 'column',
                justifyContent: 'space-around',
                width: dimensionsForRatio['1.91/1'].width + 'px',
                height: dimensionsForRatio['1.91/1'].height + 'px',
                backgroundImage: 'linear-gradient(to right, #0f0c29, #0b6bcb, #0f0c29)',
                color: '#ffffff',
                padding: '20px',
                gap: '10px',
            }}
        >
            <span
                style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                }}
            >
                {question}
            </span>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    padding: '10px',
                    paddingTop: '12px',
                    paddingBottom: '12px',
                    borderRadius: '4px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: '#fff',
                    fontSize: '16px',
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
                                fontSize: '14px',
                            }}
                        >
                            {option.displayLabel}
                            <span
                                style={{
                                    fontFamily: 'Roboto',
                                    fontSize: '12px',
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
                                width={`${percentageForEachOption[option.index]}%`}
                                height="30"
                                rx="15"
                                ry="15"
                                fill="yellow"
                            />
                        </svg>
                    </div>
                ))}
            </div>
        </div>
    )
}
