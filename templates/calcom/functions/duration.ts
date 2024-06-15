'use server'
import type { BuildFrameData, FrameActionPayload } from '@/lib/farcaster'
import type { Config, State } from '..'
import PageView from '../views/Duration'
import NotSatisfied from '../views/NotSatisfied'

export default async function duration(
    body: FrameActionPayload,
    config: Config,
    state: State,
    params: any
): Promise<BuildFrameData> {
    let containsUserFID = true
    if (config.karmaGating) {
        const url = 'https://graph.cast.k3l.io/scores/personalized/engagement/fids?k=1&limit=1000'
        const options = {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: `["${config.fid}"]`,
        }

        try {
            const response = await fetch(url, options)
            const data = await response.json()

            containsUserFID = data.result.some((item: any) => item.fid === body.untrustedData.fid)
        } catch (error) {
            console.log(error)
        }
    }

    if (!containsUserFID) {
        return {
            buttons: [],
            component: NotSatisfied(config),
            functionName: 'initial',
        }
    }
    return {
        buttons: [
            {
                label: '15min',
            },
            {
                label: '30min',
            },
        ],

        component: PageView(config),
        functionName: 'date',
    }
}
