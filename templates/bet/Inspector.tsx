'use client'
import { Button, Input, ColorPicker } from '@/sdk/components'
import { useFrameConfig, useFarcasterId, useFarcasterName, useUploadImage } from '@/sdk/hooks'
import { Configuration } from '@/sdk/inspector'
import { Avatar, Switch } from '@/sdk/components'
import { FrameError } from '@/sdk/error'

import { getUserDataByFarcasterUsername } from './utils/farcaster'
import { useRef, useEffect } from 'react'
import type { Config } from '.'

export default function Inspector() {
    const [config, updateConfig] = useFrameConfig<Config>()

    const { privacy, claim, opponent, arbitrator, asset, amount, owner } = config

    const claimInputRef = useRef<HTMLInputElement>(null)
    const opponentInputRef = useRef<HTMLInputElement>(null)
    const arbitratorInputRef = useRef<HTMLInputElement>(null)
    const assetInputRef = useRef<HTMLInputElement>(null)
    const amountInputRef = useRef<HTMLInputElement>(null)

    const fid = useFarcasterId()
    const username = useFarcasterName()
    const uploadImage = useUploadImage()

    // Set owner if it's not already set
    useEffect(() => {
        const fetchData = async () => {
            if (username) {
                try {
                    const data = await getUserDataByFarcasterUsername(username);
                    updateConfig({
                        owner: {
                            username,
                            fid: data.fid,
                            custody_address: data.custody_address,
                            pfp_url: data.pfp_url,
                        },
                    });
                } catch (err) {
                    throw new FrameError(`Failed to fetch data for owner ${username}`);
                }
            }
        };
        fetchData();
    }, []);

    const handleSetRoles = async () => {
        try {
            const opponentData = opponentInputRef.current?.value
                ? await getUserDataByFarcasterUsername(opponentInputRef.current.value)
                : null
            const arbitratorData = arbitratorInputRef.current?.value
                ? await getUserDataByFarcasterUsername(arbitratorInputRef.current.value)
                : null

            updateConfig({
                opponent: opponentData
                    ? {
                          username: opponentInputRef.current.value,
                          fid: opponentData.fid,
                          custody_address: opponentData.custody_address,
                          pfp_url: opponentData.pfp_url,
                      }
                    : null,
                arbitrator: arbitratorData
                    ? {
                          username: arbitratorInputRef.current.value,
                          fid: arbitratorData.fid,
                          custody_address: arbitratorData.custody_address,
                          pfp_url: arbitratorData.pfp_url,
                      }
                    : null,
            })

            if (opponentInputRef.current) opponentInputRef.current.value = ''
            if (arbitratorInputRef.current) arbitratorInputRef.current.value = ''
        } catch (error) {
            throw new FrameError(`Invalid opponent or arbitrator farcaster username`)
        }
    }

    return (
        <Configuration.Root>
            {/* Gerneral and Cover Section */}
            <Configuration.Section title="Gerneral and Cover">
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
                        <p className="text-gray-300">(if you open privacy mode, others cannot see your bet claim!)</p>
                    </div>
                </div>
            </Configuration.Section>
            {/* Claim Section */}
            <Configuration.Section title="Claim">
                <p className="text-white">{JSON.stringify(config)}</p>
                <p className="text-white">{claim || 'No claim set'}</p>

                <div className="text-white flex flex-col gap-2">
                    <Input
                        className="text-lg text-white"
                        placeholder="I bet you that…"
                        ref={claimInputRef}
                    />
                    <Button
                        onClick={() => {
                            if (!claimInputRef.current?.value) return
                            updateConfig({ claim: claimInputRef.current.value })
                            claimInputRef.current.value = ''
                        }}
                        className="w-full bg-border hover:bg-secondary-border text-white"
                    >
                        Set Claim
                    </Button>
                </div>
            </Configuration.Section>

            {/* Roles Section */}
            <Configuration.Section title="Roles">
                <h2 className="text-white text-lg font-bold">Owner</h2>
                <div className="flex flex-row gap-2 items-center">
                    <Avatar.Root style={{ width: 36, height: 36 }}>
                        <Avatar.Image src={owner?.pfp_url || defaultAvatar} />
                    </Avatar.Root>
                    <p className="text-white">
                        {owner?.username ? `${owner.username} (FID: ${owner.fid})` : 'No owner set'}
                    </p>
                </div>
                <h2 className="text-white text-lg font-bold">Opponent</h2>
                <div className="flex flex-row gap-2 items-center">
                    <Avatar.Root style={{ width: 36, height: 36 }}>
                        <Avatar.Image src={opponent?.pfp_url || defaultAvatar} />
                    </Avatar.Root>
                    <p className="text-white">
                        {opponent?.username ? `${opponent.username} (FID: ${opponent.fid})` : 'No opponent set'}
                    </p>
                </div>
                <Input
                    className="text-lg text-white"
                    placeholder="Opponent username"
                    ref={opponentInputRef}
                />
                <h2 className="text-white text-lg font-bold">Arbitrator</h2>
                <div className="flex flex-row gap-2 items-center">
                    <Avatar.Root style={{ width: 36, height: 36 }}>
                        <Avatar.Image src={arbitrator?.pfp_url || defaultAvatar} />
                    </Avatar.Root>
                    <p className="text-white">
                        {arbitrator?.username ? `${arbitrator.username} (FID: ${arbitrator.fid})` : 'No arbitrator set'}
                    </p>
                </div>
                <Input
                    className="text-lg text-white"
                    placeholder="Arbitrator username"
                    ref={arbitratorInputRef}
                />

                <Button
                    onClick={handleSetRoles}
                    className="w-full bg-border hover:bg-secondary-border text-white"
                >
                    Set Roles
                </Button>
            </Configuration.Section>

            {/* Prize Section */}
            <Configuration.Section title="Prize">
                <h2 className="text-white text-xl font-bold">Asset Address</h2>
                <p className="text-white">{asset || 'No asset set'}</p>

                <Input
                    className="text-lg text-white"
                    placeholder="Asset address"
                    ref={assetInputRef}
                />

                <h2 className="text-white text-xl font-bold">Amount</h2>
                <p className="text-white">{amount || 'No amount set'}</p>

                <Input
                    className="text-xl text-white"
                    placeholder="Amount"
                    type="number"
                    ref={amountInputRef}
                />

                <Button
                    onClick={() => {
                        updateConfig({
                            asset: assetInputRef.current?.value as Address || '0x0',
                            amount: amountInputRef.current?.value ? Number(amountInputRef.current.value) : 0,
                        })
                        assetInputRef.current.value = ''
                        amountInputRef.current.value = ''
                    }}
                    className="w-full bg-border hover:bg-secondary-border text-white"
                >
                    Set Prize
                </Button>
                {/* Reset Defaults */}
                <Button
                    variant="destructive"
                    className="w-full text-white mt-8"
                    onClick={() => updateConfig({
                        claim: '',
                        opponent: null,
                        arbitrator: null,
                        asset: '0x0',
                        amount: 0,
                    })}
                >
                    Reset Default
                </Button>
            </Configuration.Section>
        </Configuration.Root>
    )
}