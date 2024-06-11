'use server'
import type { BuildFrameData } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, State } from '..'
import CoverView from '../views/Cover'
import { duration } from 'dayjs'

export default async function initial(config: Config): Promise<BuildFrameData> {
    const roboto = await loadGoogleFontAllVariants('Roboto')
    console.log('config :' + config.ownerName)
    // const data = {
    //   ownerName: config.ownerName,
    //   ownerFid: config.ownerFid,
    //   ownerImg: config.ownerImg,

    //   desc: config.desc,

    //   duration: config.duration,
    //   date: config.date,
    //   slot: config.slot,
    // };
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

    return {
        buttons: [
            { label: 'Start' },
            {
                label: 'Go to app',
                action: 'link',
                target: 'http://localhost:3000/',
            },
        ],
        fonts: roboto,
        component: CoverView(data),
        functionName: 'start',
    }
}
