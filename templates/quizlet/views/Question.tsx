import type { Config as BaseConfig } from '..'

type Config = {
    qna: BaseConfig['qna'][number]
    total: number
}

export default function QuestionView({ qna, total }: Config) {
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
                    height: '10',
                    width: `${percentage}%`,
                    top: 0,
                    position: 'absolute',
                    left: 0,
                    backgroundColor: qna.design?.barColor || 'yellow',
                }}
            />
        </div>
    )
}
