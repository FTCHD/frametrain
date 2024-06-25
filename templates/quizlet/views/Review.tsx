import type { Config as BaseConfig } from '..'

type Config = {
    qna: BaseConfig['qna'][number]
    userAnswer: string
    total: number
}

/**
 * ReviewAnswersView
 *
 * This is the view for the review of the answers
 * It displays the question, the answer given and the correct answer
 *
 * @param config
 * @returns
 */

export default function ReviewAnswersView(config: Config) {
    const { qna, userAnswer, total } = config

    const question = qna.question.toUpperCase()
    const answers = qna.answers.toUpperCase().split('\n')
    const percentage = (qna.index + 1 / total) * 100

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                alignItems: 'center',
                width: '100%',
                height: '100%',
                fontFamily: qna.design?.qnaFont ?? 'Roboto',
                fontStyle: qna.design?.qnaStyle ?? 'normal',
                background: qna.design?.backgroundColor ?? '#09203f',
            }}
        >
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    gap: '20px',
                    padding: '30px',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative',
                }}
            >
                <span
                    style={{
                        fontSize: qna.design?.questionSize ?? '20px',
                        color: qna.design?.questionColor ?? 'white',
                        textAlign: 'center',
                        textWrap: 'balance',
                    }}
                >
                    {question}
                </span>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '5px',
                        // padding: '20px',
                        width: '100%',
                        fontSize: qna.design?.answersSize ?? '20px',
                        color: qna.design?.answersColor ?? 'white',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {answers.map((answer) => (
                        <span
                            key={answer}
                            style={{
                                textAlign: 'center',
                                opacity: '0.8',
                                textWrap: 'balance',
                            }}
                        >
                            {answer}
                        </span>
                    ))}
                </div>
            </div>
            <div
                style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    position: 'absolute',
                    padding: '10px',
                    bottom: 0,
                    left: 0,
                    color: qna.design?.reviewColor ?? 'white',
                    background: qna.design?.reviewBackgroundColor ?? 'rgba(255, 255, 255, 0.22)',
                }}
            >
                <div
                    style={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'row',
                        borderRadius: '10px',
                        padding: '10px',
                        justifyContent: 'space-between',
                    }}
                >
                    <span style={{ fontSize: qna.design?.reviewSize ?? '20px', fontWeight: 500 }}>
                        Your Answer: {userAnswer}
                        <span
                            style={{
                                paddingLeft: '5px',
                            }}
                        >
                            {userAnswer === qna.answer ? ' ✅' : ' ❌'}
                        </span>
                    </span>
                </div>
                <div
                    style={{
                        // width: '100%',
                        display: 'flex',
                        flexDirection: 'row',
                        borderRadius: '10px',
                        padding: '10px',
                        justifyContent: 'space-between',
                    }}
                >
                    <span style={{ fontSize: qna.design?.reviewSize ?? '20px', fontWeight: 500 }}>
                        Correct Answer: {qna.answer}
                    </span>
                </div>
            </div>
            <div
                style={{
                    display: 'flex',
                    width: '100%',
                    top: 0,
                    position: 'absolute',
                    left: 0,
                    borderRadius: '50%',
                }}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="none"
                    width="100%"
                    height="10"
                >
                    <rect
                        x="0"
                        y="0"
                        width="300"
                        height="10"
                        rx="15"
                        ry="15"
                        fill="#e0e0e070" // 70% opacity
                    />
                    <rect
                        id="progressBar"
                        x="0"
                        y="0"
                        width={(300 * percentage) / 100}
                        height="10"
                        rx="15"
                        ry="15"
                        fill={qna.design?.barColor || 'yellow'}
                    />
                </svg>
            </div>
        </div>
    )
}
