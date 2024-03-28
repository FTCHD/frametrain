
import { Box, LinearProgress, Stack, Typography } from '@mui/joy'

const FUNNY_MESSAGES = [
    "It's not always #000000 and #FFFFFF",
    'Deploying killer robots...',
    'Making the magic happen...',
    'Doing the thing...',
    'Calling the shots...',
    'Developers, developers, developers.',
    'Time is precious, waste it wisely!',
    'Low battery. Please charge.',
    'Waiting in line..',
    'Procedurally doing nothing...',
    'DO hold your breath ;)',
    'Breeding more bits...',
    'Changing brake fluid...',
    'Sending IP to FBI...',
]

export default function Loading() {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                px: { md: 10 },
                height: '100%',
                width: '100%',
            }}
        >
            <Stack
                textAlign={'center'}
                spacing={4}
                width={'100%'}
                justifyContent={'center'}
                alignItems={'center'}
            >
                <LinearProgress
                    size="lg"
                    thickness={30}
                    color="primary"
                    sx={{ width: '100%', maxWidth: '500px' }}
                />
                <Typography level="h4" color="primary">
                    {FUNNY_MESSAGES[Math.floor(Math.random() * FUNNY_MESSAGES.length)]}
                </Typography>
            </Stack>
        </Box>
    )
}
