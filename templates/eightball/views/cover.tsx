import type { Config } from '..'
import type React from 'react'

export interface CoverConfig {
    title: string
    subtitle: string
    bottomMessage: string
    backgroundColor: string
    textColor: string
}

export default function CoverView(config: Config): React.ReactNode {
    const coverConfig: CoverConfig = {
        title: config.coverConfig.title?.text || 'Magic 8 Ball',
        subtitle:
            config.coverConfig.subtitle?.text || 'Ask a question and receive mystical guidance!',
        bottomMessage: config.coverConfig.bottomMessage?.text || "Tap 'Ask' to begin",
        backgroundColor: config.coverConfig?.backgroundColor || '#000000',
        textColor: config.coverConfig?.textColor || '#FFFFFF',
    }

    const containerStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '40px',
        fontFamily: 'Roboto, sans-serif',
        boxSizing: 'border-box',
        backgroundColor: coverConfig.backgroundColor,
        color: coverConfig.textColor,
    }

    const titleStyle: React.CSSProperties = {
        display: 'flex',
        fontSize: '36px',
        fontWeight: 'bold',
        marginBottom: '20px',
    }

    const ballContainerStyle: React.CSSProperties = {
        display: 'flex',
        position: 'relative',
        width: '200px',
        height: '200px',
    }

    const outerBallStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        backgroundColor: '#1a1a1a',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0 0 20px rgba(255,255,255,0.3)',
    }

    const innerBallStyle: React.CSSProperties = {
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
    }

    const subtitleStyle: React.CSSProperties = {
        fontSize: '24px',
        marginTop: '20px',
        textAlign: 'center',
    }

    const bottomMessageStyle: React.CSSProperties = {
        fontSize: '18px',
        marginTop: '40px',
    }

    return (
        <div style={containerStyle}>
            <h1 style={titleStyle}>{coverConfig.title}</h1>
            <div style={ballContainerStyle}>
                <div style={outerBallStyle}>
                    <div style={innerBallStyle}>8</div>
                </div>
            </div>
            <p style={subtitleStyle}>{coverConfig.subtitle}</p>
            <p style={bottomMessageStyle}>{coverConfig.bottomMessage}</p>
        </div>
    )
}
