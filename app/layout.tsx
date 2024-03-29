import ThemeRegistry from '@/components/foundation/ThemeRegistry'
import type { Metadata } from 'next'
import { SessionProvider } from 'next-auth/react'
import type React from 'react'
import { Toaster } from 'react-hot-toast'
import './global.css'

export const metadata: Metadata = {
    title: {
        default: 'FrameTrain',
        template: '%s | FrameTrain',
    },
    icons: {
        icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🚂</text></svg>',
    },
}

export default function Layout(props: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <ThemeRegistry>
                <html lang="en">
                    <body
                        style={{
                            height: '100dvh',
                            width: '100dvw',
                            margin: 0,
                            padding: 0,
                        }}
                    >
                        {props.children}

                        <Toaster
                            position="bottom-center"
                            toastOptions={{
                                duration: 3000,
                            }}
                        />
                    </body>
                </html>
            </ThemeRegistry>
        </SessionProvider>
    )
}
