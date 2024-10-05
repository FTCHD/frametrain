'use client'

import { wagmiAdapter, projectId } from '@/lib/wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit } from '@reown/appkit/react'
import { mainnet, arbitrum, base, optimism, polygon, zora, gnosis, binanceSmartChain } from '@reown/appkit/networks'
import React, { type ReactNode } from 'react'
import { WagmiProvider, type Config } from 'wagmi'

// Set up queryClient
const queryClient = new QueryClient()

if (!projectId) {
    throw new Error('Project ID is not defined')
}

// Set up metadata
const metadata = {
    name: "FrameTrain",
    description: "Farcaster Frames Builder",
    url: "https://frametra.in", // origin must match your domain & subdomain
    icons: ["/og.png"]
}

// Create the modal
const modal = createAppKit({
    adapters: [wagmiAdapter],
    projectId,
    networks: [mainnet, optimism, base, zora, arbitrum, gnosis, polygon, binanceSmartChain], // list get from @/sdk/viem
    defaultNetwork: mainnet,
    metadata: metadata,
    features: {
        analytics: false, // Optional - defaults to your Cloud configuration
    }
})

function ContextProvider({ children }: { children: ReactNode; }) {
    return (
        <WagmiProvider config={wagmiAdapter.wagmiConfig as Config}>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </WagmiProvider>
    )
}

export default ContextProvider
