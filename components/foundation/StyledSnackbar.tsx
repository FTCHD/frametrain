import { type ColorPaletteProp, Snackbar } from '@mui/joy'
import { toast } from 'react-hot-toast'

export default function showSnackbar(
    children: React.ReactNode,
    color: ColorPaletteProp = 'success'
) {
    toast.custom((t) => <StyledSnackbar color={color}>{children}</StyledSnackbar>)
}

function StyledSnackbar({
    color,
    children,
}: { color: ColorPaletteProp; children: React.ReactNode }) {
    return (
        <Snackbar
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
            }}
            sx={{ 
                fontWeight: '500',
                flexDirection: 'column',
            }}
            animationDuration={0}
            size="lg"
            open={true}
            variant="plain"
            disableWindowBlurListener={true}
            color={color}
            key={color}
        >
            {children}
        </Snackbar>
    )
}