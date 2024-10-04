'use client'
import type React from 'react'
import { formatCurrency } from '../utils/formatters'

interface SwapViewProps {
    inputAmount: string
    outputTokens: Array<{ symbol: string; amount: string }>
    onAmountChange: (amount: string) => void
}

export const SwapView: React.FC<SwapViewProps> = ({
    inputAmount,
    outputTokens,
    onAmountChange,
}) => (
    <div className="swap-view" style={styles.container}>
        <h2 style={styles.title}>Swap Preview</h2>
        <div style={styles.inputContainer}>
            <label htmlFor="inputAmount" style={styles.label}>
                Input Amount:
            </label>
            <input
                id="inputAmount"
                type="number"
                value={inputAmount}
                onChange={(e) => onAmountChange(e.target.value)}
                style={styles.input}
            />
        </div>
        <h3 style={styles.subtitle}>You will receive:</h3>
        <ul style={styles.list}>
            {outputTokens.map((token, index) => (
                <li key={index} style={styles.listItem}>
                    {token.symbol}: {formatCurrency(token.amount)}
                </li>
            ))}
        </ul>
    </div>
)

const styles = {
    container: {
        fontFamily: 'Arial, sans-serif',
        color: '#333',
        padding: '20px',
        backgroundColor: '#f5f5f5',
        borderRadius: '10px',
        maxWidth: '400px',
        margin: '0 auto',
    },
    title: {
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '10px',
        textAlign: 'center' as const,
    },
    subtitle: {
        fontSize: '18px',
        marginBottom: '15px',
        textAlign: 'center' as const,
    },
    amount: {
        fontSize: '20px',
        fontWeight: 'bold',
        marginBottom: '15px',
        textAlign: 'center' as const,
    },
    note: {
        fontSize: '14px',
        fontStyle: 'italic',
        marginTop: '15px',
        textAlign: 'center' as const,
    },
}

export default SwapView
