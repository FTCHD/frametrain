'use server'

import axios from 'axios'
import type { ReservoirOrderResponse } from '../types'

const RESERVOIR_API_KEY = process.env.RESERVOIR_API_KEY
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
    const response = await reservoirClient.post('/execute/buy/v7', {
        items: [{ token: `${contractAddress}:${tokenId}` }],
        taker: takerAddress,
        source: 'frametrain-nft-marketplace',
    })

    return response.data
}

export async function createListing(
    contractAddress: string,
    tokenId: string,
    makerAddress: string
): Promise<ReservoirOrderResponse> {
    const response = await reservoirClient.post('/execute/list/v5', {
        maker: makerAddress,
        source: 'frametrain-nft-marketplace',
        params: [
            {
                token: `${contractAddress}:${tokenId}`,
                weiPrice: '1000000000000000000',
            },
        ],
    })

    return response.data
}
