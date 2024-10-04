'use client'
import type React from 'react'
import { formatCurrency } from '../utils/formatters'

interface ConfirmViewProps {
    paymentOptions: string[]
    portfolioValue: string
    selectedNetwork: string
}

export const ConfirmView: React.FC<ConfirmViewProps> = ({
    paymentOptions,
    portfolioValue,
    selectedNetwork,
}) => (
    <div className="confirm-view" style={styles.container}>
        <h2 style={styles.title}>Confirm Portfolio Copy</h2>
        <p style={styles.subtitle}>Network: {selectedNetwork}</p>
        <p style={styles.portfolioValue}>Portfolio Value: {formatCurrency(portfolioValue)}</p>
        <div style={styles.divider}></div>
        <h3 style={styles.sectionTitle}>Select Payment Token</h3>
        <div style={styles.optionsContainer}>
            {paymentOptions.map((option, index) => (
                <div key={index} style={styles.option}>
                    <span style={styles.optionText}>{option}</span>
                </div>
            ))}
        </div>
        <p style={styles.note}>Click on a token to proceed with the copy</p>
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
        fontSize: '16px',
        marginBottom: '5px',
        textAlign: 'center' as const,
    },
    portfolioValue: {
        fontSize: '20px',
        fontWeight: 'bold',
        marginBottom: '15px',
        textAlign: 'center' as const,
    },
    divider: {
        borderBottom: '1px solid #ccc',
        marginBottom: '15px',
    },
    sectionTitle: {
        fontSize: '18px',
        marginBottom: '10px',
    },
    optionsContainer: {
        display: 'flex',
        justifyContent: 'space-around',
        flexWrap: 'wrap' as const,
        gap: '10px',
    },
    option: {
        backgroundColor: '#fff',
        border: '2px solid #007bff',
        borderRadius: '5px',
        padding: '10px 15px',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
    },
    optionText: {
        fontWeight: 'bold',
        color: '#007bff',
    },
    note: {
        fontSize: '14px',
        fontStyle: 'italic',
        marginTop: '15px',
        textAlign: 'center' as const,
    },
}

export default ConfirmView
