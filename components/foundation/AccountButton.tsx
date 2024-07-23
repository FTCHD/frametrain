'use client'
import {
    AuthKitProvider,
    SignInButton,
    type StatusAPIResponse,
    useProfile,
} from '@farcaster/auth-kit'
import '@farcaster/auth-kit/styles.css'
import { getCsrfToken, signIn, signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { LogOut } from 'react-feather'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../shadcn/Tooltip'

export default function AccountButton() {
    const sesh = useSession()
    const router = useRouter()
    const [isLoggingIn, setIsLoggingIn] = useState(true)
    const [timeSpent, setTimeSpent] = useState(0)

    const { isAuthenticated } = useProfile()

    const getNonce = useCallback(async () => {
        const nonce = await getCsrfToken()
        if (!nonce) throw new Error('Unable to generate nonce')
        return nonce
    }, [])

    const increaseTimeSpent: () => ReturnType<typeof setTimeout> | undefined = useCallback(() => {
        if (isLoggingIn) {
            setTimeSpent((prev) => prev + 1)
            return setTimeout(increaseTimeSpent, 1000)
        }
        return undefined
    }, [isLoggingIn])

    const handleLogin = useCallback(
        (res: StatusAPIResponse) => {
            setIsLoggingIn(true)

            increaseTimeSpent()

            signIn('credentials', {
                message: res.message,
                signature: res.signature,
                name: res.username,
                pfp: res.pfpUrl,
                redirect: false,
            }).then((r) => {
                if (!r?.error) {
                    router.refresh()
                }
            })
        },
        [router, increaseTimeSpent]
    )
	
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
            ) : isLoggingIn ? (
                <div className="flex flex-col justify-center items-center w-full h-full gap-2">
                    <div className="w-8 h-8 rounded-full border-4 border-blue-500 animate-spin border-r-transparent " />
                    {timeSpent > 5 && <p className="text-sm">Stuck? Try refreshing the page!</p>}
                </div>
            ) : (
                <SignInButton
                    nonce={getNonce}
                    onSuccess={handleLogin}
                    onSignOut={() => signOut()}
                    hideSignOut={true}
                />
            )}
        </AuthKitProvider>
    )
}
