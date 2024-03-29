'use client'
import { Stack, Typography } from '@mui/joy'
import { useSession } from 'next-auth/react'
import NextLink from 'next/link'
import AccountButton from './AccountButton'

export default function Header() {
    const sesh = useSession()

    return (
        <Stack direction={'row'} justifyContent={'space-between'} paddingX={3} paddingY={2}>
            <Typography level="h1" sx={{ textDecoration: 'none' }} component={NextLink} href={'/'}>
                FrameTrain
            </Typography>
            {sesh.status === 'authenticated' && <AccountButton />}
        </Stack>
    )
}
