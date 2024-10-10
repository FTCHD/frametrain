import type React from 'react'
import type { Config } from '..'

type StyleProps = React.CSSProperties

const defaultStyles: Record<string, StyleProps> = {
    container: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '40px',
        fontFamily: 'Roboto, sans-serif',
        boxSizing: 'border-box',
    },
    title: {
        fontSize: '36px',
        fontWeight: 'bold',
        marginBottom: '20px',
    },
    ballContainer: {
        position: 'relative',
        width: '200px',
        height: '200px',
    },
    outerBall: {
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        backgroundColor: '#1a1a1a',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0 0 20px rgba(255,255,255,0.3)',
    },
    innerBall: {
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        backgroundColor: '#0000ff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        fontSize: '64px',
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: '24px',
        marginTop: '20px',
        textAlign: 'center',
    },
    bottomMessage: {
        fontSize: '18px',
        marginTop: '40px',
    },
}

const StyledDiv: React.FC<{ style: StyleProps; children?: React.ReactNode }> = ({
    style,
    children,
}) => <div style={style}>{children}</div>

export default function CoverView({ cover }: Config) {
    const containerStyle = {
        ...defaultStyles.container,
        backgroundColor: cover.backgroundColor || 'black',
        color: cover.textColor || 'white',
    }

    return (
        <StyledDiv style={containerStyle}>
            <StyledDiv style={defaultStyles.title}>{cover.title || 'Magic 8 Ball'}</StyledDiv>
            <StyledDiv style={defaultStyles.ballContainer}>
                <StyledDiv style={defaultStyles.outerBall}>
                    <StyledDiv style={defaultStyles.innerBall}>8</StyledDiv>
                </StyledDiv>
            </StyledDiv>
            <StyledDiv style={defaultStyles.subtitle}>
                {cover.subtitle || 'Ask a question and receive mystical guidance!'}
            </StyledDiv>
            <StyledDiv style={defaultStyles.bottomMessage}>
                {cover.bottomMessage || "Tap 'Ask' to begin"}
            </StyledDiv>
        </StyledDiv>
    )
}
