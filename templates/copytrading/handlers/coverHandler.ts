import type { BuildFrameData } from '@/lib/farcaster'
import { runGatingChecks } from '@/lib/gating'
import BasicView from '@/sdk/views/BasicView'
import type { Config, Storage } from '../types'
import { fetchPortfolioData } from '../utils/portfolioUtils'
import CustomCoverView from '../views/customCoverView'

export default async function coverHandler({
    config,
    storage,
    body,
}: { config: Config; storage: Storage; body: any }): Promise<BuildFrameData> {
    const portfolioData = await fetchPortfolioData(config.walletAddress, config.chainId)

    await runGatingChecks(body, config.gating)

    const updatedStorage: Storage = {
        ...storage,
        portfolioValue: portfolioData.totalValue,
        portfolioTokens: portfolioData.tokens,
    }

    return {
        component: config.useBasicViewForCover
            ? BasicView({ title: `Portfolio Value: $${portfolioData.totalValue}` })
            : CustomCoverView({
                  portfolioValue: portfolioData.totalValue,
                  tokens: portfolioData.tokens.slice(0, 5),
              }),
        buttons: [{ label: 'Copy Portfolio' }],
        handler: 'confirm',
        storage: updatedStorage,
    }
}
