import axios from 'axios'

import { API_BASE_URL } from '../constants'

export async function getTokenBalances(address: string, chainId: number): Promise<Token[]> {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/v1/${chainId}/address/${address}/balances`
        )
        return response.data.balances
    } catch (error) {
        console.error('Error fetching token balances:', error)
        throw new Error('Failed to fetch token balances')
    }
}

export async function getTokenPrices(
    tokens: string[],
    chainId: number
): Promise<Record<string, number>> {
    try {
        const response = await axios.get(`${API_BASE_URL}/v1/${chainId}/prices`, {
            params: { tokens: tokens.join(',') },
        })
        return response.data
    } catch (error) {
        console.error('Error fetching token prices:', error)
        throw new Error('Failed to fetch token prices')
    }
}

export async function buildMulticallTransaction(
    buyOrders: any[],
    chainId: number,
    amount: string
): Promise<any> {
    try {
        const response = await axios.post(`${API_BASE_URL}/v1/${chainId}/multiplex`, {
            orders: buyOrders,
            amount,
        })
        return response.data
    } catch (error) {
        console.error('Error building multicall transaction:', error)
        throw new Error('Failed to build multicall transaction')
    }
}

export async function checkAllowance(
    owner: string,
    token: string,
    chainId: number
): Promise<{ isApproved: boolean }> {
    try {
        const response = await axios.get(`${API_BASE_URL}/v1/${chainId}/token/${token}/allowance`, {
            params: { owner },
        })
        return response.data
    } catch (error) {
        console.error('Error checking allowance:', error)
        throw new Error('Failed to check token allowance')
    }
}
