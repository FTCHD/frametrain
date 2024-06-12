'use server'
import type { BuildFrameData, FrameActionPayload } from '@/lib/farcaster'
import type { Config, State } from '..'
import PageView from '../views/Start'
import { getkarma } from '../utils/getKarma'

export default async function page(
    body: FrameActionPayload,
    config: Config,
    state: State,
    params: any
): Promise<BuildFrameData> {
    const data = Object.assign(
        {},
        {
            ownerName: config.ownerName,
            ownerFid: config.ownerFid,
            ownerImg: config.ownerImg,

            desc: config.desc,

            duration: config.duration,
            date: config.date,
            slot: config.slot,
            durationSelected: config.durationSelected,
            dateSelected: config.dateSelected,
            slotSelected: config.slotSelected,
        }
    )
    const karma = await getkarma(config.ownerFid.toString())
    console.log(karma)
    let containsUserFID = true
    if (karma) {
        const url = 'https://graph.cast.k3l.io/scores/personalized/engagement/fids?k=1&limit=1000'
        const options = {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: `["${config.ownerFid}"]`,
        }

        try {
            const response = await fetch(url, options)
            const data = await response.json()
            console.log(data)
            containsUserFID = data.result.some((item: any) => item.fid === body.untrustedData.fid)
        } catch (error) {
            console.log(error)
        }
    }
    return {
        buttons: [
            {
                label: 'Schedule Now',
            },
        ],
        component: PageView(data),
        functionName: containsUserFID ? 'duration' : 'notsatisfied',
    }
}
