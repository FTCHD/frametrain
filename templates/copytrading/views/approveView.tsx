'use client'
import type React from 'react'
import { formatCurrency } from '../utils/formatters'

interface ApproveViewProps {
    token: string
    amount: string
}

export const ApproveView: React.FC<ApproveViewProps> = ({ token, amount }) => (
    <div className="approve-view" style={styles.container}>
        <h2 style={styles.title}>Approve Token</h2>
        <p style={styles.subtitle}>Please approve {token} for trading</p>
        <p style={styles.amount}>Amount: {formatCurrency(amount, token)}</p>
        <p style={styles.note}>Click 'Approve' to continue with the copytrading process</p>
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

export default ApproveView
