'use client'
import { Input, ColorPicker, Select } from '@/sdk/components'
import { useFrameConfig, useFarcasterId, useFarcasterName, useUploadImage } from '@/sdk/hooks'
import { Configuration } from '@/sdk/inspector'
import { Avatar, Switch } from '@/sdk/components'
import { getUserDataByFarcasterUsername } from './utils/farcaster'
import { supportedTokens, supportedChains } from './utils/constant'
import { useEffect } from 'react'
import type { Config, User } from '.'

export default function Inspector() {
    const [config, updateConfig] = useFrameConfig<Config>()
    const { privacy, claim, opponent, arbitrator, amount, owner, chain, deadline } = config
    const fid = useFarcasterId()
    const username = useFarcasterName()
    const uploadImage = useUploadImage()

    useEffect(() => {
        const fetchData = async () => {
            if (username) {
                const data = await getUserDataByFarcasterUsername(username)
                updateConfig({
                    owner: {
                        username,
                        fid: fid,
                        wallet_address: data.wallet_address,
                        pfp_url: data.pfp_url,
                    },
                })
            }
        }
        fetchData()
    }, [username, fid, updateConfig])

    const handleSetRolesOnBlur = async (field: 'opponent' | 'arbitrator', value: string) => {
        try {
            const data = await getUserDataByFarcasterUsername(value)
            updateConfig({
                [field]: {
                    username: value,
                    fid: data.fid,
                    wallet_address: data.wallet_address,
                    pfp_url: data.pfp_url,
                },
            })
        } catch (error) {
            updateConfig({ [field]: null })
        }
    }

    function RoleInput({
        title,
        user,
        field,
    }: {
        title: string
        user: User | null
        field: 'opponent' | 'arbitrator'
    }) {
        const lowercaseTitle = title.toLowerCase()

        return (
            <div className="flex flex-col gap-y-2">
                <h2 className="text-white text-lg font-bold">{title}</h2>
                <div className="flex items-center gap-x-2">
                    {user?.pfp_url && (
                        <Avatar.Root style={{ width: 36, height: 36 }}>
                            <Avatar.Image src={user.pfp_url} />
                        </Avatar.Root>
                    )}
                    <p className="text-white">
                        {user?.username
                            ? `${user.username} (FID: ${user.fid})`
                            : `Please enter a valid ${lowercaseTitle} username`}
                    </p>
                </div>
                <Input
                    className="text-lg text-white"
                    placeholder={`${title} username`}
                    defaultValue={user?.username || ''}
                    onBlur={(e) => handleSetRolesOnBlur(field, e.target.value)}
                />
            </div>
        )
    }

    return (
        <Configuration.Root>
            <Configuration.Section title="General and Cover">
                <div className="flex flex-col gap-y-8">
                    <div className="flex flex-col gap-y-4">
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
                                    base64String,
                                    contentType,
                                })
                                return filePath
                            }}
                        />
                    </div>

                    <div className="flex flex-col gap-y-4">
                        <h2 className="text-lg text-white font-bold">Text Color</h2>
                        <ColorPicker
                            className="w-full"
                            background={config.textColor || 'white'}
                            setBackground={(value) => updateConfig({ textColor: value })}
                        />
                    </div>

                    <div className="flex flex-col gap-y-4">
                        <h2 className="text-lg text-white font-bold">Deadline</h2>
                        <p className="text-white">
                            {deadline ? (
                                <>
                                    Timestamp: {deadline}
                                    <br />
                                    Local time: {new Date(deadline * 1000).toLocaleString()}
                                    <br />
                                    Time from now: {(() => {
                                        const diff = deadline * 1000 - Date.now()
                                        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
                                        const hours = Math.floor(
                                            (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
                                        )
                                        const minutes = Math.floor(
                                            (diff % (1000 * 60 * 60)) / (1000 * 60)
                                        )
                                        return `${days} day${days !== 1 ? 's' : ''} ${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`
                                    })()}
                                </>
                            ) : (
                                'No deadline set'
                            )}
                        </p>
                        <Input
                            className="text-lg text-white"
                            placeholder="Set deadline"
                            type="datetime-local"
                            defaultValue={
                                deadline ? new Date(deadline * 1000).toISOString().slice(0, 16) : ''
                            }
                            onBlur={(e) => {
                                const timestamp = Math.floor(
                                    new Date(e.target.value).getTime() / 1000
                                )
                                updateConfig({ deadline: timestamp })
                            }}
                        />
                    </div>

                    <div className="flex flex-col gap-y-2">
                        <div className="flex items-center gap-x-2">
                            <Switch
                                checked={privacy}
                                onCheckedChange={() => updateConfig({ privacy: !privacy })}
                            />
                            <p className="text-white font-bold">Privacy Mode</p>
                        </div>
                        <p className="text-gray-300">
                            (Enabling privacy mode hides your bet claim from others)
                        </p>
                    </div>
                </div>
            </Configuration.Section>

            <Configuration.Section title="Claim">
                <div className="flex flex-col gap-y-4">
                    <p className="text-white">{claim || 'No claim set'}</p>
                    <Input
                        className="text-lg text-white"
                        placeholder="I bet you that…"
                        defaultValue={claim}
                        onBlur={(e) => updateConfig({ claim: e.target.value })}
                    />
                </div>
            </Configuration.Section>

            <Configuration.Section title="Roles">
                <div className="flex flex-col gap-y-6">
                    <div className="flex flex-col gap-y-2">
                        <h2 className="text-white text-lg font-bold">Owner</h2>
                        <div className="flex items-center gap-x-2">
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
                    </div>
                    <RoleInput title="Opponent" user={opponent} field="opponent" />
                    <RoleInput title="Arbitrator" user={arbitrator} field="arbitrator" />
                </div>
            </Configuration.Section>

            <Configuration.Section title="Prize">
                <div className="flex flex-col gap-y-6">
                    <div className="flex flex-col gap-y-2">
                        <h2 className="text-white text-xl font-bold">Chain</h2>
                        <p className="text-white">{chain ? chain : 'No chain selected'}</p>
                        <Select
                            value={config.chain || ''}
                            placeholder="Select chain"
                            onChange={(newSelection) => updateConfig({ chain: newSelection })}
                        >
                            {supportedChains.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <div className="flex flex-col gap-y-2">
                        <h2 className="text-white text-xl font-bold">Token</h2>
                        <p className="text-white">
                            {config.token ? config.token.name : 'No tokens set'}
                        </p>
                        <Select
                            value={config.token?.id || ''}
                            placeholder="Select token"
                            onChange={(newSelection) => {
                                const selectedToken = supportedTokens.find(
                                    (token) => token.id === newSelection
                                )
                                if (selectedToken) updateConfig({ token: selectedToken })
                            }}
                        >
                            {supportedTokens.map((token) => (
                                <option key={token.id} value={token.id}>
                                    {token.name}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <div className="flex flex-col gap-y-2">
                        <h2 className="text-white text-xl font-bold">Amount</h2>
                        <p className="text-white">{amount || 'No amount set'}</p>
                        <Input
                            className="text-xl text-white"
                            placeholder="Amount"
                            type="number"
                            defaultValue={amount || 0}
                            onBlur={(e) => updateConfig({ amount: Number(e.target.value) })}
                        />
                    </div>
                </div>
            </Configuration.Section>
        </Configuration.Root>
    )
}
