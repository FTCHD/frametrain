'use client'
import type React from 'react'
import { formatCurrency } from '../utils/formatters'

interface CustomCoverViewProps {
    portfolioValue: string
    tokens: Array<{ symbol: string; value: string }>
}

export const CustomCoverView: React.FC<CustomCoverViewProps> = ({ portfolioValue, tokens }) => (
    <div style={styles.container}>
        <h1 style={styles.title}>Portfolio Overview</h1>
        <p style={styles.portfolioValue}>Total Value: {formatCurrency(portfolioValue)}</p>
        <div style={styles.tokenList}>
            {tokens.slice(0, 5).map((token, index) => (
                <div key={index} style={styles.tokenItem}>
                    <span style={styles.tokenSymbol}>{token.symbol}</span>
                    <span style={styles.tokenValue}>{formatCurrency(token.value)}</span>
                </div>
            ))}
        </div>
        <p style={styles.instruction}>Click 'Copy Portfolio' to start</p>
    </div>
)

const styles = {
    container: {
        fontFamily: 'Arial, sans-serif',
        padding: '20px',
        backgroundColor: '#f0f0f0',
        borderRadius: '10px',
        maxWidth: '400px',
        margin: '0 auto',
    },
    title: {
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '15px',
        textAlign: 'center' as const,
    },
    portfolioValue: {
        fontSize: '20px',
        fontWeight: 'bold',
        marginBottom: '20px',
        textAlign: 'center' as const,
    },
    tokenList: {
        marginBottom: '20px',
    },
    tokenItem: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '10px',
    },
    tokenSymbol: {
        fontWeight: 'bold',
    },
    tokenValue: {
        color: '#007bff',
    },
    instruction: {
        fontSize: '16px',
        fontStyle: 'italic',
        textAlign: 'center' as const,
    },
}

export default CustomCoverView
