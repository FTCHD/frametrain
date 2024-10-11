import React from 'react'

interface ErrorViewProps {
    error: string
}

export default function ErrorView({ error }: ErrorViewProps): React.ReactElement {
    const containerStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        backgroundColor: '#FF4136',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px',
        fontFamily: 'Roboto, sans-serif',
        color: 'white',
        boxSizing: 'border-box',
    }

    const errorStyle: React.CSSProperties = {
        fontSize: '24px',
        fontWeight: 'bold',
        textAlign: 'center',
    }

    return (
        <div style={containerStyle}>
            <div style={errorStyle}>{error}</div>
        </div>
    )
}
