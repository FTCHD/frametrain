'use server'
import type { BuildFrameData, FrameValidatedActionPayload } from '@/lib/farcaster'
import type { Config } from '..'
import PageView from '../views/Page'
import { FrameError } from '@/sdk/error'
import NopeView from '../views/Nope'

export default async function page({
    body,
    config,
    storage,
    params,
}: {
    body: FrameValidatedActionPayload
    config: Config
    storage: Storage
    params: any
}): Promise<BuildFrameData> {
    const user = body.validatedData.interactor
    const cast = body.validatedData.cast
    const errors: {
        message: string
        type: string
        basic: boolean
    }[] = []

    if (!config.username) {
        throw new FrameError('Frame not configured')
    }

    if (config.requirements?.basic) {
        if (config.requirements.basic.casted && !cast.viewer_context.recasted) {
            errors.push({ message: 'recast', type: 'ctx', basic: true })
        }

        if (config.requirements.basic.liked && !cast.viewer_context.liked) {
            errors.push({ message: 'like', type: 'ctx', basic: true })
        }

        if (config.requirements.basic.following && !user.viewer_context.following) {
            errors.push({ message: `follow @${config.username}`, type: 'follow', basic: true })
        }

        if (config.requirements.basic.follower && !user.viewer_context.followed_by) {
            errors.push({
                message: `be a follower of @${config.username}`,
                type: 'follow',
                basic: true,
            })
        }

        if (config.requirements.basic.power && !user.power_badge) {
            errors.push({ message: 'power badge user', type: 'be', basic: true })
        }

        if (config.requirements.basic.eth && !user.verified_addresses.eth_addresses.length) {
            errors.push({ message: 'an ethereum', type: 'wallets', basic: true })
        }

        if (config.requirements.basic.sol && !user.verified_addresses.sol_addresses.length) {
            errors.push({ message: 'a solana', type: 'wallets', basic: true })
        }
    }

    if (config.requirements.maxFid > 0 && user.fid > config.requirements.maxFid) {
        errors.push({
            message: `an FID less than ${config.requirements.maxFid}`,
            type: 'have',
            basic: true,
        })
    }

    if (config.requirements.score > 0) {
        const url = `https://graph.cast.k3l.io/scores/personalized/engagement/fids?k=${config.requirements.score}&limit=1000`
        const options = {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: `["${user.fid}"]`,
        }

        try {
            const response = await fetch(url, options)
            const data = await response.json()

            containsUserFID = data.result.some(
                (item: any) => item.fid === body.validatedData.interactor.fid
            )
        } catch {
            throw new FrameError('Failed to fetch your engagement data')
        }
    }

    if (errors.length) {
        return {
            buttons: [{ label: 'Try again' }],
            component: NopeView({ config, errors }),
            handler: 'page',
        }
    }

    console.log('page handler', { user, cast })
    return {
        buttons: [
            {
                label: '←',
            },
        ],
        component: PageView(config),
        handler: 'initial',
    }
}
