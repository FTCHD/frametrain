'use server'
import type { BuildFrameData, FramePayloadValidated } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import type { Config, Storage } from '..'
import { buyNft } from '../common/reservoir'

export default async function txData({
    body,
    config,
    params,
}: {
    // GET requests don't have a body.
    body: FramePayloadValidated
    config: Config
    storage: Storage
    params: { nftAddress: string; quantity?: string } | undefined
}): Promise<BuildFrameData> {
    if (!(body.address && config.owner && config.nfts.length)) {
        throw new FrameError('Frame not fully configured')
    }

    const nft = config.nfts.find((n) => n.token.contract === params?.nftAddress)
    const quantity = params?.quantity === undefined ? 1 : Number.parseInt(params?.quantity)

    if (!nft) {
        throw new FrameError('NFT not found')
    }

    const res = await buyNft({ nft, quantity, address: body.address })

    if (typeof res === 'string') {
        throw new FrameError(res)
    }

    return {
        transaction: res as BuildFrameData['transaction'],
    }
}
