'use client'
import {
    AuthKitProvider,
    SignInButton,
    type StatusAPIResponse,
    useProfile,
} from '@farcaster/auth-kit'
import '@farcaster/auth-kit/styles.css'
import { IconButton } from '@mui/joy'
import { getCsrfToken, signIn, signOut, useSession } from 'next-auth/react'
import { useCallback } from 'react'
import { LogOut } from 'react-feather'

export default function AccountButton() {
    const sesh = useSession()

    const { isAuthenticated } = useProfile()

    const getNonce = useCallback(async () => {
        const nonce = await getCsrfToken()
        if (!nonce) throw new Error('Unable to generate nonce')
        return nonce
    }, [])

    const handleLogin = useCallback((res: StatusAPIResponse) => {
        signIn('credentials', {
            message: res.message,
            signature: res.signature,
            name: res.username,
            pfp: res.pfpUrl,
            redirect: false,
        })
    }, [])

    return (
        <AuthKitProvider>
            {isAuthenticated || sesh?.status === 'authenticated' ? (
                <IconButton
                    onClick={() => {
                        signOut()
                    }}
                >
                    <LogOut size={16} />
                </IconButton>
            ) : (
                <SignInButton
                    nonce={getNonce}
                    onSuccess={handleLogin}
                    onSignOut={() => signOut()}
                />
            )}
        </AuthKitProvider>
    )
}
