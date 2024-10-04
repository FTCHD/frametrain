import type { BuildFrameData } from '@/lib/farcaster'
import BasicView from '@/sdk/views/BasicView'
import type { Config, Storage } from '../types'

export default async function successHandler({
    config,
    storage,
}: { config: Config; storage: Storage }): Promise<BuildFrameData> {
    const lastTransaction = storage.transactions[storage.transactions.length - 1]

    const updatedStorage: Storage = {
        ...storage,
        transactions: storage.transactions.map((tx) =>
            tx.hash === lastTransaction.hash ? { ...tx, status: 'success' } : tx
        ),
    }

    return {
        component: config.useBasicViewForSuccess
            ? BasicView({
                  title: 'Portfolio Copied!',
                  subtitle: `Transaction: ${lastTransaction.hash}`,
              })
            : null,
        buttons: [{ label: 'View Portfolio' }],
        handler: 'cover',
    }
}
