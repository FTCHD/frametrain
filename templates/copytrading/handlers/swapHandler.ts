import type { BuildFrameData } from '@/lib/farcaster'
import BasicView from '@/sdk/views/BasicView'
import type { Config, Storage } from '../types'
import { buildMulticallTransaction, checkAllowance } from '../utils/0xApiUtils'
import ApproveView from '../views/approveView'

export default async function swapHandler({
    config,
    storage,
}: { config: Config; storage: Storage }): Promise<BuildFrameData> {
    const selectedToken = storage.selectedToken
    const amount = storage.inputAmount

    const allowance = await checkAllowance(
        config.walletAddress,
        selectedToken,
        config.selectedNetwork
    )

    if (!allowance.isApproved) {
        return {
            component: ApproveView({ token: selectedToken, amount }),
            buttons: [{ label: 'Approve' }],
            handler: 'approve',
        }
    }

    const buyOrders = storage.portfolioTokens
        .filter((token) => !config.blacklistedTokens.includes(token.address))
        .filter(
            (token) =>
                config.whitelistedTokens.length === 0 ||
                config.whitelistedTokens.includes(token.address)
        )
        .slice(0, config.maxTokens)
        .map((token) => ({
            token: token.address,
            percentage: token.percentage,
        }))

    const transaction = await buildMulticallTransaction(buyOrders, config.chainId)

    const updatedStorage: Storage = {
        ...storage,
        transactions: [...storage.transactions, { hash: transaction.hash, status: 'pending' }],
    }

    return {
        component: BasicView({
            title: 'Ready to Swap',
            subtitle: `Copying ${buyOrders.length} tokens`,
        }),
        buttons: [{ label: 'Confirm Swap' }],
        handler: 'success',
        transaction,
        storage: updatedStorage,
    }
}
