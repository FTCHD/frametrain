import type { BuildFrameData } from '@/lib/farcaster'
import { PAYMENT_OPTIONS } from '../constants'
import type { Config, Storage } from '../types'
import { ConfirmView } from '../views/confirmView'

export default async function confirmHandler({
    config,
    storage,
}: { config: Config; storage: Storage }): Promise<BuildFrameData> {
    return {
        component: ConfirmView({ paymentOptions: PAYMENT_OPTIONS }),
        buttons: PAYMENT_OPTIONS.map((option) => ({ label: option })),
        handler: 'swap',
    }
}
