'use server'
import type { BuildFrameData, FrameActionPayload } from '@/lib/farcaster'
import type { Config, State } from '..'
import PageView from '../views/Confirm'
import { encodeFunctionData } from 'viem'
import type { Abi } from 'viem'

import { ABI } from '../utils/const'
import { getNextSixDates } from '../utils/date'

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
    const dates = getNextSixDates()
    const date = dates[params.date]

    const calldata = encodeFunctionData({
        abi: ABI,
        functionName: 'bookCall',
        args: [
            config.ownerFid,
            body.untrustedData.fid,
            params.slot,
            params.duration,
            date,
            6,
            2024,
        ],
    })

    const txData = {
        chainId: 'eip155:84532', // OP Mainnet 10
        method: 'eth_sendTransaction',
        params: {
            abi: ABI as Abi,
            to: '0x51d51C87e7f55547D202FCdBb5713bF9d4a5f6A4',
            data: calldata,
            value: '0',
        },
    }

    console.log(txData)
    return {
        buttons: [
            {
                label: 'Dicard ❌',
            },
            {
                label: 'Confirm ✅',
                action: 'tx',
                // target: `https://cal-cast-v2.vercel.app/frames/txdata?fid=eyJmaWQiOjIxNTc4MSwiZHVyYXRpb24iOjE1fQ%3D%3D&ownerName=fabianferno&ownerimg=https%3A%2Fi.imgur.com%2F56ZfLrq.jpg&d=${params.date}&datefixed=true&t=${params.slot}&timefixed=true&confirm=true&userfid=${body.untrustedData.fid}&owner=${config.ownerFid}&duration=15&__bi=2-tx`,
                target: `${process.env.NEXT_PUBLIC_HOST}/api/txdata?fid=eyJmaWQiOjIxNTc4MSwiZHVyYXRpb24iOjE1fQ%3D%3D&ownerName=${config.ownerName}&ownerimg=${config.ownerImg}&d=${params.date}&datefixed=true&t=${params.slot}&timefixed=true&confirm=true&userfid=${body.untrustedData.fid}&owner=${config.ownerFid}&duration=${params.duration}&__bi=2-tx`,
            },
        ],
        component: await PageView(data),
        functionName: 'duration',
    }
}
