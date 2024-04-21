'use client'
import {
    AuthKitProvider,
    SignInButton,
    type StatusAPIResponse,
    useProfile,
} from '@farcaster/auth-kit'
import '@farcaster/auth-kit/styles.css'
import { getCsrfToken, signIn, signOut, useSession } from 'next-auth/react'
import { useCallback } from 'react'
import { LogOut } from 'react-feather'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../shadcn/Tooltip'

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
                <TooltipProvider delayDuration={0}>
                    <Tooltip>
                        <TooltipTrigger>
                            <LogOut
                                size={16}
                                onClick={() => signOut()}
                                className="cursor-pointer stroke-white/40"
                            />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-72 mr-8" side="bottom">
                            <p>Tap to sign out</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
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
