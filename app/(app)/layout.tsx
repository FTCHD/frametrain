import { ThemeProvider } from '@/components/foundation/ThemeProvider'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import type React from 'react'
import { Toaster } from 'react-hot-toast'
import '../global.css'

export default function Layout(props: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="dark">
            {props.children}

            <Analytics />
            <SpeedInsights />

            <Toaster
                position="bottom-center"
                toastOptions={{
                    duration: 3000,
                }}
            />
        </ThemeProvider>
    )
}
