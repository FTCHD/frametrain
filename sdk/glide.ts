import { createGlideConfig } from '@paywithglide/glide-js'
import { type ChainKey, getViem } from './viem'

export function getGlide(chain: ChainKey) {
    const client = getViem(chain)

    return createGlideConfig({
        projectId: process.env.GLIDE_PROJECT_ID!,
        chains: [client.chain],
    })
}