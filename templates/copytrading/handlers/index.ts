import type { BuildFrameData, FramePayloadValidated } from '@/lib/farcaster'
import type { Config, Storage } from '../types'
import { fetchPortfolioData } from '../utils/portfolioUtils'
import PageView from '../views/pageView'
import approveHandler from './approveHandler'
import confirmHandler from './confirmHandler'
import coverHandler from './coverHandler'
import successHandler from './successHandler'
import swapHandler from './swapHandler'

type HandlerFunction = (params: {
    body: FramePayloadValidated
    config: Config
    storage: Storage
    params: any
}) => Promise<BuildFrameData>

const createHandler = <T extends HandlerFunction>(handler: T): T => handler

const handlers: Record<string, HandlerFunction> = {
    cover: createHandler(coverHandler),
    confirm: createHandler(confirmHandler),
    approve: createHandler(approveHandler),
    swap: createHandler(swapHandler),
    success: createHandler(successHandler),
}

export async function page({
    body,
    config,
    storage,
    params,
}: {
    body: FramePayloadValidated
    config: Config
    storage: Storage
    params: any
}): Promise<BuildFrameData> {
    const portfolioData = await fetchPortfolioData(config.walletAddress, config.selectedNetwork)
    return {
        buttons: [
            {
                label: '← Back to Frame',
            },
        ],
        aspectRatio: '1:1',
        component: PageView({
            config,
            portfolioValue: portfolioData.totalValue,
            portfolioTokens: portfolioData.tokens,
        }),
        handler: 'initial',
    }
}

export { handlers }
