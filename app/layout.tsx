
import type { Metadata } from 'next'
import { SessionProvider } from 'next-auth/react'
import ContextProvider from '@/lib/context'
import type React from 'react'
import './global.css'

export const metadata: Metadata = {
    title: {
        default: 'Farcaster Frames Builder',
        template: '%s | FrameTrain',
    },
    description:
        'Post your Frames to Warpcast, Supercast, or Nook with the no-code Frames builder from the future. Now available with integrated Neynar Frame Validation.',
    alternates: {
        canonical: 'https://frametra.in',
    },
    keywords:
        'farcaster, warpcast, neynar, airstack, moxie, supercast, framesjs, frogfm, gated frames, no code frames builder, farcaster poll, farcaster form, free farcaster frames',
    icons: {
        icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🚂</text></svg>',
    },
    twitter: {
        title: 'Farcaster Frames Builder',
    },
    metadataBase: new URL('https://frametra.in'),
    openGraph: {
        title: 'Farcaster Frames Builder',
        type: 'website',
        url: 'https://frametra.in',
        images: [
            {
                url: '/og.png',
                width: 1200,
                height: 630,
                alt: 'Farcaster Frames Builder',
                type: 'image/png',
            },
        ],
    },
}

export default function Layout(props: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <html lang="en">
                <body
                    style={{
                        height: '100dvh',
                        width: '100dvw',
                        margin: 0,
                        padding: 0,
                        backgroundColor: '#17101f',
                    }}
                >
                    <ContextProvider>
                        {props.children}
                    </ContextProvider>
                </body>
            </html>
        </SessionProvider>
    )
}
