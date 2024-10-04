'use server'

import axios from 'axios'
import type { ReservoirOrderResponse } from '../types'

const RESERVOIR_API_KEY = process.env.RESERVOIR_API_KEY
if (!RESERVOIR_API_KEY) {
    throw new Error('RESERVOIR_API_KEY is not defined in the environment variables.')
}

const RESERVOIR_API_BASE_URL = 'https://api.reservoir.tools'

const reservoirClient = axios.create({
    baseURL: RESERVOIR_API_BASE_URL,
    headers: {
        'x-api-key': RESERVOIR_API_KEY,
    },
})

export async function buyTokens(
    contractAddress: string,
    tokenId: string,
    takerAddress: string
): Promise<ReservoirOrderResponse> {
    try {
        const response = await reservoirClient.post('/execute/buy/v7', {
            items: [{ token: `${contractAddress}:${tokenId}` }],
            taker: takerAddress,
            source: 'frametrain-nft-marketplace',
        })

        return response.data
    } catch (error) {
        throw new Error(`Failed to buy tokens: ${error.message}`)
    }
}

export async function createListing(
    contractAddress: string,
    tokenId: string,
    makerAddress: string,
    weiPrice: string
): Promise<ReservoirOrderResponse> {
    try {
        const response = await reservoirClient.post('/execute/list/v5', {
            maker: makerAddress,
            source: 'frametrain-nft-marketplace',
            params: [
                {
                    token: `${contractAddress}:${tokenId}`,
                    weiPrice: weiPrice,
                },
            ],
        })

        return response.data
    } catch (error) {
        throw new Error(`Failed to create listing: ${error.message}`)
    }
}
