import type { BaseStorage } from '@/lib/types'
import Inspector from './Inspector'
import { DEFAULT_NETWORK, MAX_TOKENS_LIMIT, SUPPORTED_NETWORKS } from './constants'
import cover from './cover.jpeg'
import handlers from './handlers'
import type { Config, CopytradingTemplate } from './types'

export interface Storage extends BaseStorage {}

const initialConfig: Config = {
    walletAddress: '',
    networks: SUPPORTED_NETWORKS,
    selectedNetwork: DEFAULT_NETWORK.chainId,
    whitelistedTokens: [SUPPORTED_NETWORKS[0].tokens.MOXIE],
    blacklistedTokens: [],
    maxTokens: MAX_TOKENS_LIMIT,
    gating: {
        requirements: {
            minFid: 0,
            maxFid: 0,
            score: 0,
            channels: [],
            exactFids: [],
            erc20: null,
            erc721: null,
            erc1155: null,
            moxie: null,
        },
    },
    useBasicViewForCover: true,
    useBasicViewForSuccess: true,
}

const copytradingTemplate: CopytradingTemplate = {
    name: 'Copytrading',
    description: 'Copy the portfolio of the Frame creator',
    octicon: 'moon', // https://docs.farcaster.xyz/reference/actions/spec#valid-icons
    creatorFid: 'codingsh',
    creatorName: 'FrameTrain',
    cover,
    enabled: true,
    Inspector,
    handlers,
    initialConfig,
    events: [],
}

export default copytradingTemplate
