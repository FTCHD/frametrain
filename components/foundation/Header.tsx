'use client'
import { useSession } from 'next-auth/react'
import NextLink from 'next/link'
import AccountButton from './AccountButton'

export default function Header() {
    const sesh = useSession()

    return (
        <section className="flex flex-row justify-between items-center px-4 py-2">
            <NextLink href="/" className="text-5xl font-bold">
                FrameTrain
            </NextLink>
            {sesh.status === 'authenticated' && <AccountButton />}
        </section>
    )
}
