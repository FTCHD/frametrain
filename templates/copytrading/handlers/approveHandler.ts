import type { BuildFrameData } from '@/lib/farcaster'
import BasicView from '@/sdk/views/BasicView'
import type { Config, Storage } from '../types'
import { checkAllowance } from '../utils/0xApiUtils'

export default async function approveHandler({
    config,
    storage,
}: { config: Config; storage: Storage }): Promise<BuildFrameData> {
    const selectedToken = storage.selectedToken
    const allowance = await checkAllowance(config.walletAddress, selectedToken, config.chainId)

    if (allowance.isApproved) {
        return swapHandler({ config, storage })
    }

    return {
        component: BasicView({
            title: 'Approval Required',
            subtitle: `Please approve ${selectedToken} for trading`,
        }),
        buttons: [{ label: 'Approve' }],
        handler: 'swap',
    }
}
