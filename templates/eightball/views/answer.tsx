import type { Config } from '../types'

interface AnswerViewProps {
    config: Config
    answer: string
    question: string
}

export default function AnswerView({
    config,
    answer,
    question,
}: AnswerViewProps): React.ReactElement {
    const { answerConfig } = config

    const containerStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        backgroundColor: answerConfig.backgroundColor || 'black',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '40px',
        fontFamily: 'Roboto, sans-serif',
        color: answerConfig.textColor || 'white',
        boxSizing: 'border-box',
    }

    const titleStyle: React.CSSProperties = {
        fontSize: '36px',
        fontWeight: 'bold',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'center',
    }

    const ballContainerStyle: React.CSSProperties = {
        position: 'relative',
        width: '300px',
        height: '300px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    }

    const ballStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        backgroundColor: '#1a1a1a',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0 0 30px rgba(255,255,255,0.3)',
    }

    const innerBallStyle: React.CSSProperties = {
        width: '150px',
        height: '150px',
        borderRadius: '50%',
        backgroundColor: '#0000ff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        textAlign: 'center',
    }

    const answerTextStyle: React.CSSProperties = {
        display: 'flex',
        fontSize: '24px',
        fontWeight: 'bold',
    }

    const bottomMessageStyle: React.CSSProperties = {
        fontSize: '18px',
        marginTop: '40px',
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'center',
    }

    const questionStyle: React.CSSProperties = {
        display: 'flex',
        fontSize: '24px',
        marginBottom: '20px',
        textAlign: 'center',
    }

    return (
        <div style={containerStyle}>
            <div style={titleStyle}>{answerConfig.title.text || 'The 8 Ball says...'}</div>
            <div style={questionStyle}>Question: {question}</div>
            <div style={ballContainerStyle}>
                <div style={ballStyle}>
                    <div style={innerBallStyle}>
                        <div style={answerTextStyle}>{answer}</div>
                    </div>
                </div>
            </div>
            <div style={bottomMessageStyle}>
                {answerConfig.bottomMessage.text || 'Ask another question to play again!'}
            </div>
        </div>
    )
}
