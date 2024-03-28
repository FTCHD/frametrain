'use client'
import AccountButton from '@/components/foundation/AccountButton'
import '@farcaster/auth-kit/styles.css'
import { Stack, Typography } from '@mui/joy'

export const runtime = 'edge'

export default function Home() {
    return (
        <Stack height={'100%'} width={'100%'}>
            <Stack
                gap={2}
                width={'100%'}
                height={'100%'}
                justifyContent={'center'}
                alignItems={'center'}
                textAlign={'center'}
            >
                <Typography level="h1" fontSize={'3rem'}>
                    Welcome to Frametrain!
                </Typography>
                <Typography level="body-lg">Sign in with Farcaster to get started.</Typography>
                <AccountButton />
            </Stack>
        </Stack>
    )
}
