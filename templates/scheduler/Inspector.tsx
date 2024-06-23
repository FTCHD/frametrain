'use client'
import { Button } from '@/components/shadcn/Button'
import { Input } from '@/components/shadcn/Input'
import { useFrameConfig } from '@/sdk/hooks'
import { useEffect, useRef, useState } from 'react'
import type { Config } from '.'
import { useSession } from 'next-auth/react'

import { encodeFunctionData } from 'viem'
import type { Abi } from 'viem'

import { ABI } from './utils/const'
import { getProfile } from './utils/getProfile'
import { client } from './utils/config'
import { Toggle } from '@/components/shadcn/Toggle'

export default function Inspector() {
    const [profileExist, setProfileExist] = useState<any>(null)
    const [farcasterId, setFarcasterId] = useState<any>(0)

    const [profile, setProfile] = useState<{
        _karmaGatingEnabled: boolean
        _profileMetadata: string
        _price: number
        _startTimeInSecs: number
        _endTimeInSecs: number
    }>({
        _karmaGatingEnabled: false,
        _profileMetadata: '',
        _price: 0,
        _startTimeInSecs: 0,
        _endTimeInSecs: 0,
    })

    function generateTimeSlots(startTime: number, endTime: number): number[] {
        // biome-ignore lint/style/useConst: <explanation>
        let slots = []
        for (let i = startTime; i <= endTime; i += 900) {
            slots.push(i)
        }
        return slots
    }

    const [config, updateConfig] = useFrameConfig<Config>()
    const sesh = useSession()
    console.log(sesh.data?.user?.id)

    const handleSubmit = async () => {
        console.log(profile)
        const calldata = encodeFunctionData({
            abi: ABI,
            functionName: 'createProfile',
            args: [
                // sesh.data?.user?.id, // Farcaster ID
                farcasterId,

                generateTimeSlots(profile._startTimeInSecs, profile._endTimeInSecs), // Time slots
                [900], // Time periods
                [profile._price], // Pricing
                profile._karmaGatingEnabled, // Karma Gating
                profile._profileMetadata, // Metadata
            ],
        })
        console.log(calldata)
        const hash = await client.sendTransaction({
            to: '0x51d51C87e7f55547D202FCdBb5713bF9d4a5f6A4',
            value: BigInt(0),
            abi: ABI as Abi,
            data: calldata,
        })
        console.log(hash)
        if (hash) {
            updateConfig({
                ownerName: sesh.data?.user?.name,
                // ownerFid: sesh.data?.user?.id,
                ownerFid: farcasterId,
                ownerImg: sesh.data?.user?.image,
            })
        }
    }
    //

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        if (sesh.data?.user?.id) {
            setFarcasterId(sesh.data?.user?.id)
            getProfile(farcasterId).then((profile) => {
                setProfileExist(profile)
                console.log(profile)
            })

            updateConfig({
                ownerName: sesh.data?.user?.name,
                ownerFid: farcasterId,
                ownerImg: sesh.data?.user?.image,
            })
        }
    }, [farcasterId, profileExist, sesh.data?.user?.id])

    return (
        <section className="p-5 rounded-xl flex w-full flex-col justify-start items-start">
            {profileExist ? (
                <div className="p-4 rounded grid grid-row-3 gap-3 justify-start">
                    <p>
                        <b>Meeting location: </b>
                        {profileExist.metadata}
                    </p>
                    <p>
                        <b>Your availability:</b>{' '}
                        {Number.parseInt(profileExist.timeSlots[0]) / 60 / 60} -{' '}
                        {Number.parseInt(
                            profileExist.timeSlots[profileExist.timeSlots.length - 1]
                        ) /
                            60 /
                            60}
                    </p>
                    <p>
                        <b>Your meeting price:</b> {profileExist.prices?.[0]}
                    </p>
                    <p>
                        <b>Karma Gating Enabled :</b>{' '}
                        {profileExist.karmaGatingEnabled ? 'Yes' : 'No'}
                    </p>
                    <p>
                        <b>Your meeting types:</b>{' '}
                        {profileExist?.timePeriods[0] == '900' ? '15 min' : '30 mins'}
                    </p>
                    <p>
                        <b>Your earnings</b>: {profileExist.totalEarnings} from{' '}
                        {profileExist.totalBookings} bookings
                    </p>
                    <p>
                        <p className="font-bold text-xl">Your bookings:</p>{' '}
                        {profileExist.receivedBookings.length > 0 ? (
                            <table className="min-w-full border-collapse">
                                <thead>
                                    <tr className="">
                                        <th className="border px-4 py-2">Date</th>
                                        <th className="border px-4 py-2">Time</th>
                                        <th className="border px-4 py-2">Duration</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {profileExist?.receivedBookings?.map(
                                        (booking: any, index: any) => {
                                            const date = `${booking.day}/${booking.month}/${booking.year}`
                                            const time = `${booking.timeStartInSeconds / 60 / 60}`
                                            const duration = `${
                                                booking.timePeriodInSeconds / 60 / 60
                                            } hours`

                                            return (
                                                <tr key={index} className="">
                                                    <td className="border px-4 py-2">{date}</td>
                                                    <td className="border px-4 py-2">{time}</td>
                                                    <td className="border px-4 py-2">{duration}</td>
                                                </tr>
                                            )
                                        }
                                    )}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-gray-500">No bookings yet</p>
                        )}
                    </p>
                </div>
            ) : (
                <div className="grid grid-row-4 w-full items-start gap-5">
                    <div className="flex flex-col space-y-1.5">
                        <label htmlFor="name">Choose Location</label>
                        <Input
                            onChange={(e) => {
                                setProfile({
                                    ...profile,
                                    _profileMetadata: e.target.value,
                                })
                            }}
                            type="text"
                            className="bg-black"
                            placeholder="Huddle01 Url, Zoom Link, etc."
                        />
                    </div>
                    <div className="flex flex-col space-y-1.5">
                        <label htmlFor="name">Set Price</label>
                        <Input
                            onChange={(e) => {
                                setProfile({
                                    ...profile,
                                    _price: Number.parseInt(e.target.value),
                                })
                            }}
                            type="number"
                            className="bg-black"
                            placeholder="Amount to charge per call"
                        />
                    </div>
                    <div className="flex flex-col space-y-1.5 mb-5">
                        <div>Enable Karma Gating</div>

                        <Toggle
                            variant={'outline'}
                            aria-label="Toggle italic"
                            onClick={() => {
                                profile._karmaGatingEnabled
                                    ? setProfile({ ...profile, _karmaGatingEnabled: false })
                                    : setProfile({ ...profile, _karmaGatingEnabled: true })
                            }}
                        >
                            Karma Gating
                        </Toggle>
                    </div>
                    <div className="flex flex-col space-y-1.5">
                        <label htmlFor="name">Choose availability (start/end):</label>
                        <div className="grid grid-cols-2 gap-2">
                            <Input
                                onChange={(e) => {
                                    // biome-ignore lint/style/noVar: <explanation>
                                    var a = e.target.value.split(':') // split it at the colons
                                    // biome-ignore lint/style/noVar: <explanation>
                                    var seconds = +a[0] * 60 * 60 + +a[1] * 60
                                    setProfile({
                                        ...profile,
                                        _startTimeInSecs: seconds,
                                    })
                                }}
                                type="time"
                                className="bg-black"
                                placeholder="Start time"
                            />
                            <Input
                                onChange={(e) => {
                                    // biome-ignore lint/style/noVar: <explanation>
                                    var a = e.target.value.split(':') // split it at the colons
                                    // biome-ignore lint/style/noVar: <explanation>
                                    var seconds = +a[0] * 60 * 60 + +a[1] * 60
                                    // minutes are worth 60 seconds. Hours are worth 60 minutes.
                                    setProfile({
                                        ...profile,
                                        _endTimeInSecs: seconds,
                                    })
                                }}
                                type="time"
                                className="bg-black"
                                placeholder="End time"
                            />
                        </div>
                    </div>
                </div>
            )}
            {profileExist ? (
                <></>
            ) : (
                <Button
                    onClick={handleSubmit}
                    variant={'outline'}
                    className="bg-white hover:bg-slate-300 hover:text-black text-black flex w-full mt-2"
                >
                    Create Profile
                </Button>
            )}
        </section>
    )
}
