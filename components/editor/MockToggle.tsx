import { Stack, Typography } from '@mui/joy'
import Button from '@mui/joy/Button'
import ToggleButtonGroup from '@mui/joy/ToggleButtonGroup'
import { useState } from 'react'

export default function MockOptionsToggle() {
    const [value, setValue] = useState<string[]>([])
    return (
        <Stack
            direction={{
                xs: 'column',
                md: 'row',
            }}
            gap={3}
            justifyContent={'center'}
            alignItems={'center'}
            width={'100%'}
        >
            <Typography level="title-lg">SIMULATE TOGGLES</Typography>
            <ToggleButtonGroup
                size="lg"
                variant="soft"
                // sx={{
                //     width: '100%',
                // }}
                value={value}
                onChange={(_, newValue) => {
                    setValue(newValue)
                }}
            >
                <Button fullWidth={true} startDecorator="👀" value="recasted">
                    Recasted
                </Button>
                <Button fullWidth={true} startDecorator="❤️" value="liked">
                    Liked
                </Button>
                <Button fullWidth={true} startDecorator="👥" value="following">
                    Following
                </Button>
                <Button fullWidth={true} startDecorator="👤" value="follower">
                    Follower
                </Button>
            </ToggleButtonGroup>
        </Stack>
    )
}