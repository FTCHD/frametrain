'use client'
import type React from 'react'
import type { Config } from '../types'
import { formatCurrency, formatPercentage } from '../utils/formatters'

interface PageViewProps {
    config: Config
    portfolioValue: string
    portfolioTokens: Array<{
        symbol: string
        value: string
        percentage: number
        address: string
    }>
}

const PageView: React.FC<PageViewProps> = ({ config, portfolioValue, portfolioTokens }) => (
    <div style={styles.container}>
        <h1 style={styles.title}>Copytrading Portfolio</h1>
        <p style={styles.subtitle}>
            Network: {config.networks.find((n) => n.chainId === config.selectedNetwork)?.name}
        </p>
        <p style={styles.portfolioValue}>Total Value: {formatCurrency(portfolioValue)}</p>

        <div style={styles.tokenList}>
            <div style={styles.tokenHeader}>
                <span style={styles.tokenHeaderCell}>Token</span>
                <span style={styles.tokenHeaderCell}>Value</span>
                <span style={styles.tokenHeaderCell}>Allocation</span>
            </div>
            {portfolioTokens.map((token, index) => (
                <div key={index} style={styles.tokenRow}>
                    <span style={styles.tokenCell}>{token.symbol}</span>
                    <span style={styles.tokenCell}>{formatCurrency(token.value)}</span>
                    <span style={styles.tokenCell}>{formatPercentage(token.percentage)}</span>
                </div>
            ))}
        </div>

        <div style={styles.info}>
            <p>Whitelisted Tokens: {config.whitelistedTokens.length}</p>
            <p>Blacklisted Tokens: {config.blacklistedTokens.length}</p>
            <p>Max Tokens: {config.maxTokens}</p>
        </div>

        <p style={styles.note}>Use the Frame to copy this portfolio</p>
    </div>
)

const styles = {
    container: {
        fontFamily: 'Arial, sans-serif',
        padding: '20px',
        backgroundColor: '#f0f0f0',
        borderRadius: '10px',
        maxWidth: '600px',
        margin: '0 auto',
    },
    title: {
        fontSize: '28px',
        fontWeight: 'bold',
        marginBottom: '10px',
        textAlign: 'center' as const,
    },
    subtitle: {
        fontSize: '18px',
        marginBottom: '15px',
        textAlign: 'center' as const,
    },
    portfolioValue: {
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '20px',
        textAlign: 'center' as const,
    },
    tokenList: {
        marginBottom: '20px',
    },
    tokenHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        fontWeight: 'bold',
        marginBottom: '10px',
        borderBottom: '2px solid #333',
        paddingBottom: '5px',
    },
    tokenHeaderCell: {
        flex: 1,
        textAlign: 'left' as const,
    },
    tokenRow: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '5px',
    },
    tokenCell: {
        flex: 1,
        textAlign: 'left' as const,
    },
    info: {
        marginTop: '20px',
        padding: '10px',
        backgroundColor: '#e0e0e0',
        borderRadius: '5px',
    },
    note: {
        fontSize: '16px',
        fontStyle: 'italic',
        textAlign: 'center' as const,
        marginTop: '20px',
    },
}

export default PageView
