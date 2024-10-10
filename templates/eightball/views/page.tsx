import type { Config, Storage } from '..'

type PageProps = {
    config: Config
    storage: Storage
    params: Record<string, unknown>
}

type Question = {
    question: string
    answer: string
    fid: number
    timestamp: number
}

const styles = {
    container: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#1a202c',
        color: 'white',
        fontFamily: 'sans-serif',
    },
    header: {
        backgroundColor: '#2a4365',
        padding: '24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    },
    titleContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: '30px',
        fontWeight: 'bold',
    },
    ballIcon: {
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        backgroundColor: 'black',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    questionCard: {
        backgroundColor: '#2d3748',
        borderRadius: '8px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    },
    avatar: {
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: '16px',
    },
} as const

const StyledDiv: React.FC<React.HTMLProps<HTMLDivElement>> = ({ style, ...props }) => (
    <div style={{ ...style }} {...props} />
)

const QuestionAnswerBlock: React.FC<{ q: Question }> = ({ q }) => {
    const items: [string, string, string][] = [
        ['Q', '#3182ce', q.question],
        ['A', '#805ad5', q.answer],
    ]

    return (
        <StyledDiv style={styles.questionCard}>
            {items.map(([label, color, text], idx) => (
                <StyledDiv
                    key={idx}
                    style={{
                        marginTop: idx ? '16px' : '0',
                        display: 'flex',
                        alignItems: 'flex-start',
                    }}
                >
                    <StyledDiv style={{ ...styles.avatar, backgroundColor: color }}>
                        <span style={{ fontWeight: 'bold', color: 'white' }}>{label}</span>
                    </StyledDiv>
                    <StyledDiv>
                        <p
                            style={{
                                fontSize: '18px',
                                fontWeight: idx === 0 ? 'bold' : 'normal',
                                marginBottom: idx === 0 ? '8px' : '0',
                            }}
                        >
                            {text}
                        </p>
                        {idx === 0 ? (
                            <p style={{ color: '#a0aec0' }}>Asked by FID: {q.fid}</p>
                        ) : (
                            <p style={{ color: '#a0aec0', marginTop: '4px' }}>
                                {new Date(q.timestamp).toLocaleString()}
                            </p>
                        )}
                    </StyledDiv>
                </StyledDiv>
            ))}
        </StyledDiv>
    )
}

const Page: React.FC<PageProps> = ({ config, storage, params }) => {
    const questions = storage.questions || []

    return (
        <StyledDiv style={styles.container}>
            <StyledDiv style={styles.header}>
                <StyledDiv style={styles.titleContainer}>
                    <h1 style={styles.title}>Magic 8 Ball Questions</h1>
                    <StyledDiv style={styles.ballIcon}>
                        <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#3182ce' }}>
                            8
                        </span>
                    </StyledDiv>
                </StyledDiv>
            </StyledDiv>
            <StyledDiv style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
                {config.isPublic ? (
                    questions.map((q, index) => <QuestionAnswerBlock key={index} q={q} />)
                ) : (
                    <StyledDiv
                        style={{ ...styles.questionCard, textAlign: 'center', padding: '32px' }}
                    >
                        <StyledDiv style={styles.ballIcon}>
                            <span
                                style={{ fontSize: '36px', fontWeight: 'bold', color: '#3182ce' }}
                            >
                                8
                            </span>
                        </StyledDiv>
                        <h2 style={{ ...styles.title, fontSize: '24px', marginBottom: '16px' }}>
                            This Magic 8 Ball's answers are private
                        </h2>
                        <p style={{ color: '#a0aec0' }}>
                            The owner has set this Magic 8 Ball to private mode. Answers are only
                            visible to the owner.
                        </p>
                    </StyledDiv>
                )}
            </StyledDiv>
        </StyledDiv>
    )
}

export default Page
