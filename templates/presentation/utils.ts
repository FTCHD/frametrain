import type { FrameButtonMetadata } from '@/lib/farcaster'
import type { CustomButtons } from '.'

export async function renderCustomButtons(
    customButtons: CustomButtons
): Promise<FrameButtonMetadata[]> {
    const buttons: FrameButtonMetadata[] = []

    for (const button of customButtons.slice(0, 4)) {
        switch (button.type) {
            case 'navigate': {
                buttons.push({
                    label: button?.label || 'Back',
                })
                break
            }
            case 'link': {
                buttons.push({
                    action: 'link',
                    label: button?.label || 'Link',
                    target: button?.target || '',
                })
                break
            }
            case 'mint': {
                buttons.push({
                    action: 'mint',
                    label: button?.label || 'Mint NFT',
                    target: button?.target || '',
                })
                break
            }
        }
    }

    return buttons
}