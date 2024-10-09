'use client'
import { Input, ColorPicker } from '@/sdk/components'
import { useFrameConfig, useFarcasterId, useFarcasterName, useUploadImage } from '@/sdk/hooks'
import { Configuration } from '@/sdk/inspector'
import { Avatar, Switch } from '@/sdk/components'
import { getUserDataByFarcasterUsername } from './utils/farcaster'
import { useState, useEffect } from 'react'
import type { Config } from '.'

export default function Inspector() {
    const [config, updateConfig] = useFrameConfig<Config>()

    const { privacy, claim, opponent, arbitrator, asset, amount, owner } = config

    const fid = useFarcasterId()
    const username = useFarcasterName()
    const uploadImage = useUploadImage()

    const [opponentInput, setOpponentInput] = useState('')
    const [arbitratorInput, setArbitratorInput] = useState('')

    // Set owner if it's not already set
    useEffect(() => {
        const fetchData = async () => {
            if (username) {
                const data = await getUserDataByFarcasterUsername(username)
                updateConfig({
                    owner: {
                        username,
                        fid: fid,
                        custody_address: data.custody_address,
                        pfp_url: data.pfp_url,
                    },
                })
            }
        }
        fetchData()
    }, [username, fid])

    const handleSetRolesOnBlur = async (field: 'opponent' | 'arbitrator', value: string) => {
        try {
            const data = await getUserDataByFarcasterUsername(value)
            updateConfig({
                [field]: {
                    username: value,
                    fid: data.fid,
                    custody_address: data.custody_address,
                    pfp_url: data.pfp_url,
                },
            })

            // Reset input value once valid
            if (field === 'opponent') {
                setOpponentInput('')
            } else {
                setArbitratorInput('')
            }
        } catch (error) {
            updateConfig({
                [field]: null,
            })

            // Store the invalid input for display
            if (field === 'opponent') {
                setOpponentInput(value)
            } else {
                setArbitratorInput(value)
            }
        }
    }

    return (
        <Configuration.Root>
            {/* General and Cover Section */}
            <Configuration.Section title="General and Cover">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-lg text-white font-bold">Background Color</h2>
                        <ColorPicker
                            className="w-full"
                            enabledPickers={['solid', 'gradient', 'image']}
                            background={
                                config.background ||
                                'linear-gradient(to right, #0f0c29, #0b6bcb, #0f0c29)'
                            }
                            setBackground={(value) => updateConfig({ background: value })}
                            uploadBackground={async (base64String, contentType) => {
                                const { filePath } = await uploadImage({
                                    base64String: base64String,
                                    contentType: contentType,
                                })

                                return filePath
                            }}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <h2 className="text-lg text-white font-semibold">Text Color</h2>
                        <ColorPicker
                            className="w-full"
                            background={config.textColor || 'white'}
                            setBackground={(value) => updateConfig({ textColor: value })}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-row gap-2 items-center">
                            <Switch
                                checked={privacy}
                                onCheckedChange={() => {
                                    updateConfig({
                                        privacy: !privacy,
                                    })
                                }}
                            />
                            <p className="text-white font-semibold">Privacy Mode</p>
                        </div>
                        <p className="text-gray-300">
                            (Enabling privacy mode hides your bet claim from others!)
                        </p>
                    </div>
                </div>
            </Configuration.Section>

            {/* Claim Section */}
            <Configuration.Section title="Claim">
                <p className="text-white">{claim || 'No claim set'}</p>

                <div className="text-white flex flex-col gap-2">
                    <Input
                        className="text-lg text-white"
                        placeholder="I bet you that…"
                        defaultValue={claim}
                        onBlur={(e) => updateConfig({ claim: e.target.value })}
                    />
                </div>
            </Configuration.Section>

            {/* Roles Section */}
            <Configuration.Section title="Roles">
                <h2 className="text-white text-lg font-bold">Owner</h2>
                <div className="flex flex-row gap-2 items-center">
                    {owner?.pfp_url && (
                        <Avatar.Root style={{ width: 36, height: 36 }}>
                            <Avatar.Image src={owner.pfp_url} />
                        </Avatar.Root>
                    )}
                    <p className="text-white">
                        {owner?.username
                            ? `${owner.username} (FID: ${owner.fid})`
                            : 'Please enter a valid owner username'}
                    </p>
                </div>

                <h2 className="text-white text-lg font-bold">Opponent</h2>
                <div className="flex flex-row gap-2 items-center">
                    {opponent?.pfp_url && (
                        <Avatar.Root style={{ width: 36, height: 36 }}>
                            <Avatar.Image src={opponent.pfp_url} />
                        </Avatar.Root>
                    )}
                    <p className="text-white">
                        {opponent?.username
                            ? `${opponent.username} (FID: ${opponent.fid})`
                            : opponentInput
                              ? `${opponentInput} is invalid`
                              : 'Please enter a valid opponent username'}
                    </p>
                </div>
                <Input
                    className="text-lg text-white"
                    placeholder="Opponent username"
                    defaultValue={opponentInput}
                    onBlur={(e) => handleSetRolesOnBlur('opponent', e.target.value)}
                />

                <h2 className="text-white text-lg font-bold">Arbitrator</h2>
                <div className="flex flex-row gap-2 items-center">
                    {arbitrator?.pfp_url && (
                        <Avatar.Root style={{ width: 36, height: 36 }}>
                            <Avatar.Image src={arbitrator.pfp_url} />
                        </Avatar.Root>
                    )}
                    <p className="text-white">
                        {arbitrator?.username
                            ? `${arbitrator.username} (FID: ${arbitrator.fid})`
                            : arbitratorInput
                              ? `${arbitratorInput} is invalid`
                              : 'Please enter a valid arbitrator username'}
                    </p>
                </div>
                <Input
                    className="text-lg text-white"
                    placeholder="Arbitrator username"
                    defaultValue={arbitratorInput}
                    onBlur={(e) => handleSetRolesOnBlur('arbitrator', e.target.value)}
                />
            </Configuration.Section>

            {/* Prize Section */}
            <Configuration.Section title="Prize">
                <h2 className="text-white text-xl font-bold">Asset Address</h2>
                <p className="text-white">{asset || 'No asset set'}</p>

                <Input
                    className="text-lg text-white"
                    placeholder="Asset address"
                    defaultValue={asset}
                    onBlur={(e) => updateConfig({ asset: e.target.value as Address })}
                />

                <h2 className="text-white text-xl font-bold">Amount</h2>
                <p className="text-white">{amount || 'No amount set'}</p>

                <Input
                    className="text-xl text-white"
                    placeholder="Amount"
                    type="number"
                    defaultValue={amount || 0}
                    onBlur={(e) => updateConfig({ amount: Number(e.target.value) })}
                />
            </Configuration.Section>
        </Configuration.Root>
    )
}
