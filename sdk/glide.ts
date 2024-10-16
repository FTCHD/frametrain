import { createGlideConfig } from '@paywithglide/glide-js'
import { type ChainKey, getViem } from './viem'

export function getGlide(chain: ChainKey | ChainKey[]) {
    let chainKeys: ChainKey[]
    if (typeof chain === 'string') {
        chainKeys = [chain]
    } else chainKeys = chain
    const chains = chainKeys
        .map((chainKey) => getViem(chainKey))
        .map((viemChain) => viemChain.chain)

    return createGlideConfig({
        projectId: process.env.GLIDE_PROJECT_ID!,
        chains,
    })
}
