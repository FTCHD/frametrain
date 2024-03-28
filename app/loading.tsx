
import { Box, LinearProgress } from '@mui/joy'

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
            <LinearProgress
                size="lg"
                thickness={30}
                color="primary"
                sx={{ width: '100%', maxWidth: '500px' }}
            />
        </Box>
    )
}
