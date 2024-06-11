'use server'
import type { BuildFrameData, FrameActionPayload } from '@/lib/farcaster'
import type { Config, State } from '..'
import PageView from '../views/Date'
import PrevPage from '../views/Duration'
import NextPage from '../views/Slot'
import { duration } from 'dayjs'
import { Slot } from '@radix-ui/react-slot'

export default async function page(
    body: FrameActionPayload,
    config: Config,
    state: State,
    params: any
): Promise<BuildFrameData> {
    console.log(config.ownerName)
    const buttonIndex = body.untrustedData.buttonIndex
    console.log('button index : ' + buttonIndex)
    console.log('Status of duration selected : ' + config.durationSelected)

    let date = params?.date === undefined ? 0 : Number(params?.date)

    switch (buttonIndex) {
        case 1: {
            if (params?.date === undefined) {
                console.log(params?.date)
                config.durationSelected = true
                config.duration = 0
            } else {
                console.log(params?.duration + 'else')
                const data = Object.assign(
                    {},
                    {
                        ownerName: config.ownerName,
                        ownerFid: config.ownerFid,
                        ownerImg: config.ownerImg,

                        desc: config.desc,

                        duration: params?.duration,
                        date: config.date,
                        slot: config.slot,
                        durationSelected: config.durationSelected,
                        dateSelected: config.dateSelected,
                        slotSelected: config.slotSelected,
                    }
                )
                return {
                    buttons: [
                        {
                            label: '15 min',
                            action: 'post',
                        },
                        {
                            label: '30 min',
                        },
                    ],
                    component: PrevPage(data),
                    functionName: 'date',
                }
            }
            console.log('duration before : ' + config.duration)

            const data = Object.assign(
                {},
                {
                    ownerName: config.ownerName,
                    ownerFid: config.ownerFid,
                    ownerImg: config.ownerImg,

                    desc: config.desc,

                    duration: config.duration,
                    date: date,
                    slot: config.slot,
                    durationSelected: config.durationSelected,
                    dateSelected: config.dateSelected,
                    slotSelected: config.slotSelected,
                }
            )
            console.log(config.durationSelected)
            return {
                buttons: [
                    {
                        label: 'back',
                    },
                    {
                        label: '⬅️',
                    },
                    {
                        label: '➡️',
                    },
                    {
                        label: 'proceed',
                    },
                ],
                component: PageView(data),
                functionName: 'date',
                params: {
                    date: date,
                    duration: config.duration,
                },
            }
        }
        case 2: {
            if (params?.date === undefined) {
                config.durationSelected = true
                config.duration = 1
                console.log(config.duration)
            } else {
                if (Number(params?.date) > 0) {
                    date = Number(params?.date) - 1
                    config.duration = params?.duration
                } else {
                    date = 6
                    config.duration = params?.duration
                }
            }
            const data = Object.assign(
                {},
                {
                    ownerName: config.ownerName,
                    ownerFid: config.ownerFid,
                    ownerImg: config.ownerImg,

                    desc: config.desc,

                    duration: params?.duration,
                    date: date,
                    slot: config.slot,
                    durationSelected: config.durationSelected,
                    dateSelected: config.dateSelected,
                    slotSelected: config.slotSelected,
                }
            )
            console.log('duration : ' + config.duration)
            console.log(config.durationSelected)
            return {
                buttons: [
                    {
                        label: 'back',
                    },
                    {
                        label: '⬅️',
                    },
                    {
                        label: '➡️',
                    },
                    {
                        label: 'proceed',
                    },
                ],
                component: PageView(data),
                functionName: 'date',
                params: {
                    date: date,
                    duration: config.duration,
                },
            }
        }
        case 3: {
            if (params?.date < 6) {
                date = Number(params?.date) + 1
                config.duration = params?.duration
            } else {
                date = 0
                config.duration = params?.duration
            }
            const data = Object.assign(
                {},
                {
                    ownerName: config.ownerName,
                    ownerFid: config.ownerFid,
                    ownerImg: config.ownerImg,

                    desc: config.desc,

                    duration: params?.duration,
                    date: date,
                    slot: 0,
                    durationSelected: config.durationSelected,
                    dateSelected: config.dateSelected,
                    slotSelected: config.slotSelected,
                }
            )
            console.log('duration : ' + config.duration)
            console.log(config.durationSelected)
            return {
                buttons: [
                    {
                        label: 'back',
                    },
                    {
                        label: '⬅️',
                    },
                    {
                        label: '➡️',
                    },
                    {
                        label: 'proceed',
                    },
                ],
                component: PageView(data),
                functionName: 'date',
                params: {
                    date: date,
                    duration: config.duration,
                },
            }
        }
    }
    const duration = params?.duration === undefined ? 10 : Number(params?.duration)
    const data = Object.assign(
        {},
        {
            ownerName: config.ownerName,
            ownerFid: config.ownerFid,
            ownerImg: config.ownerImg,

            desc: config.desc,

            duration: duration,
            date: date,
            slot: 0,
            durationSelected: config.durationSelected,
            dateSelected: config.dateSelected,
            slotSelected: config.slotSelected,
        }
    )
    console.log('duration : ' + config.duration)
    console.log(config.durationSelected)
    return {
        buttons: [
            {
                label: 'back',
            },
            {
                label: '⬅️',
            },
            {
                label: '➡️',
            },
            {
                label: 'proceed',
            },
        ],
        component: await NextPage(data),
        functionName: 'slot',
        params: {
            date: date,
            duration: duration,
        },
    }
}
