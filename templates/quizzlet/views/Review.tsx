import type { Config as BaseConfig } from '..'
import { choicesRepresentation } from '../utils'

type Config = Omit<BaseConfig, 'qna'> & {
    qna: BaseConfig['qna'][number]
    qnas: BaseConfig['qna']
    userAnswer: string
    colors: Record<string, string | undefined>
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
    const { qna, background, qnas, userAnswer, colors } = config

    const backgroundProp: Record<string, string> = {}

    if (colors?.background) {
        if (background.startsWith('#')) {
            backgroundProp['backgroundColor'] = colors.background
        } else {
            backgroundProp['backgroundImage'] = colors.background
        }
    } else {
        backgroundProp['backgroundImage'] = 'linear-gradient(to right, #0f0c29, #0b6bcb, #0f0c29)'
    }
    const question = qna.question.toUpperCase()
    const paragraphs = question.split('\n')

    // Get the user's answer
    // const choiceType = qna.isNumeric ? 'numeric' : 'alpha'
    const correctAnswer = qna.answer

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
                            color: colors?.textColor || 'white',
                            fontSize: '20px',
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
                    fontSize: '15px',
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
                </div>
            </div>
            {/* A view to show user's answer and the right answer */}
            {/* 
            Format: 
                Your Answer: {userAnswer} {isCorrect ? '✅' : '❌'}
                Correct Answer: {correctAnswer}
            
            */}
            <div
                style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    padding: '10px',
                }}
            >
                <div
                    style={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'row',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '10px',
                        padding: '10px',
                        justifyContent: 'space-between',
                    }}
                >
                    <span style={{ fontFamily: 'Roboto', fontSize: '20px', fontWeight: 500 }}>
                        Your Answer: {userAnswer}
                        <span
                            style={{
                                fontFamily: 'Roboto',
                                // fontSize: '20px',
                                fontWeight: 900,
                                color: 'rgba(255, 255, 255, 0.6)',
                                paddingLeft: '5px',
                                backgroundColor: 'white',
                            }}
                        >
                            {userAnswer === correctAnswer ? '✅' : '❌'}
                        </span>
                    </span>
                </div>
                <div
                    style={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'row',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '10px',
                        padding: '10px',
                        justifyContent: 'space-between',
                    }}
                >
                    <span style={{ fontFamily: 'Roboto', fontSize: '20px', fontWeight: 500 }}>
                        Correct Answer: {correctAnswer}
                    </span>
                </div>
            </div>
        </div>
    )
}
