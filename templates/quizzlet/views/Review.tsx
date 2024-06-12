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
    const { qna, background, textColor, qnas, userAnswer, colors } = config

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
                    {/* This is the answer view for the option the user chose to this question */}
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
                        <p
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
                            {userAnswer}
                        </p>
                    </div>
                    {/* This is the answer view for the correct answer to this question */}
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
                        <p
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
                            {correctAnswer}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
