'use client'
import {
    AuthKitProvider,
    SignInButton,
    type StatusAPIResponse,
    useProfile,
} from '@farcaster/auth-kit'
import '@farcaster/auth-kit/styles.css'
import BaseSpinner from '@/components/shadcn/BaseSpinner'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/shadcn/Tooltip'
import { getCsrfToken, signIn, signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { LogOut as LogOutIcon } from 'react-feather'

export default function AccountButton() {
    const sesh = useSession()
    const router = useRouter()
    const [isLoggingIn, setIsLoggingIn] = useState(false)
    const [timeSpent, setTimeSpent] = useState(0)

    const { isAuthenticated } = useProfile()

    const getNonce = useCallback(async () => {
        const nonce = await getCsrfToken()
        if (!nonce) throw new Error('Unable to generate nonce')
        return nonce
    }, [])

    const increaseTimeSpent: () => ReturnType<typeof setTimeout> | undefined = useCallback(() => {
        setTimeSpent((prev) => prev + 1)
        return setTimeout(increaseTimeSpent, 1000)
    }, [])

    const handleLogin = useCallback(
        (res: StatusAPIResponse) => {
            setIsLoggingIn(true)

            const ref = increaseTimeSpent()

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

            return () => {
                if (ref) {
                    clearTimeout(ref)
                }
            }
        },
        [router, increaseTimeSpent]
    )

    return (
        <AuthKitProvider>
            {sesh?.status === 'loading' ? (
                <div className="w-12 h-12 bg-transparent" />
            ) : isLoggingIn ? (
                <div className="flex flex-col justify-center items-center w-full h-full gap-2">
                    <BaseSpinner />
                    {timeSpent > 5 && <p className="text-sm">Stuck? Try refreshing the page!</p>}
                </div>
            ) : isAuthenticated || sesh?.status === 'authenticated' ? (
                <TooltipProvider delayDuration={0}>
                    <Tooltip>
                        <TooltipTrigger>
                            <LogOutIcon
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
                    hideSignOut={true}
                />
            )}
        </AuthKitProvider>
    )
}
