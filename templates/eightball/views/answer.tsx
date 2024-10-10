import type { Config } from '.'

export default function AnswerView(config: Config, answer: string) {
    const { answer: answerConfig } = config

    return (
        <div
            style={{
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
            }}
        >
            <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '20px' }}>
                {answerConfig.title || 'The 8 Ball says...'}
            </div>

            <div style={{ position: 'relative', width: '300px', height: '300px' }}>
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        backgroundColor: '#1a1a1a',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        boxShadow: '0 0 30px rgba(255,255,255,0.3)',
                    }}
                >
                    <div
                        style={{
                            width: '150px',
                            height: '150px',
                            borderRadius: '50%',
                            backgroundColor: '#0000ff',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: '20px',
                            textAlign: 'center',
                        }}
                    >
                        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{answer}</div>
                    </div>
                </div>
            </div>

            <div style={{ fontSize: '18px', marginTop: '40px', textAlign: 'center' }}>
                {answerConfig.bottomMessage || 'Ask another question to play again!'}
            </div>
        </div>
    )
}
