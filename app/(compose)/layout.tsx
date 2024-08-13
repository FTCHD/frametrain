import { ThemeProvider } from '@/components/foundation/ThemeProvider'
import type React from 'react'
import { Toaster } from 'react-hot-toast'
import '../global.css'

export default function Layout(props: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="class">
            {props.children}

            <Toaster
                position="bottom-center"
                toastOptions={{
                    duration: 3000,
                }}
            />
        </ThemeProvider>
    )
}
