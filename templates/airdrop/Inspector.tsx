'use client'
import {
    Button,
    ColorPicker,
    GatingInspector,
    Input,
    Label,
    Select,
    Switch,
    Textarea,
} from '@/sdk/components'
import { useFarcasterId, useFrameConfig, useFrameId, useUploadImage } from '@/sdk/hooks'
import { Configuration } from '@/sdk/inspector'
import { X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { type Address, isAddress } from 'viem'
import type { Config, LinkButton } from '.'
import { airdropChains } from '.'
import { getContractDetails, getCrossChainTokenDetails } from './utils/server_onchainUtils'

interface WhiteList {
    address: string
    amount: number
}
export default function Inspector() {
    const userFid = useFarcasterId()
    const [config, updateConfig] = useFrameConfig<Config>()
    useEffect(() => {
        if (!(userFid && config) || config.creatorId === Number(userFid)) return

        updateConfig({ creatorId: Number(userFid) })
    }, [userFid, updateConfig, config])
    return (
        <Configuration.Root>
            <Configuration.Section title="General">
                <GeneralSection />
            </Configuration.Section>
            <Configuration.Section title="Whitelist">
                <WhiteListSection />
            </Configuration.Section>
            <Configuration.Section title="Blacklist">
                <BlackListSection />
            </Configuration.Section>
            <Configuration.Section
                title="Appearance"
                description="Configure what shows up on the cover screen of your Frame."
            >
                <AppearanceSection />
            </Configuration.Section>

            <Configuration.Section title="Buttons">
                <ButtonsSection />
            </Configuration.Section>
            <Configuration.Section title="Gating">
                <GatingSection />
            </Configuration.Section>
        </Configuration.Root>
    )
}

function GatingSection() {
    const fid = useFarcasterId()
    const [config, updateConfig] = useFrameConfig<Config>()
    const enabledGating = config.enableGating ?? false
    return (
        <div>
            <div className="flex flex-row items-center justify-between gap-2 ">
                <Label className="font-md" htmlFor="gating">
                    Enable Gating?
                </Label>
                <Switch
                    id="gating"
                    checked={enabledGating}
                    onCheckedChange={(enableGating) => {
                        updateConfig({ enableGating })
                    }}
                />
            </div>

            {enabledGating && (
                <div className="flex flex-col gap-2 w-full">
                    <h2 className="text-lg font-semibold">Poll Gating options</h2>
                    <GatingInspector
                        fid={fid}
                        config={config.gating}
                        onUpdate={(option) => {
                            updateConfig({
                                gating: {
                                    ...config.gating,
                                    ...option,
                                },
                            })
                        }}
                    />
                </div>
            )}
        </div>
    )
}

function BlackListSection() {
    const [config, updateConfig] = useFrameConfig<Config>()
    const [newAddress, setNewAddress] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)

    const addBlacklistItem = () => {
        if (!isAddress(newAddress)) {
            toast('Invalid address')
            return
        }
        if (config.blacklist.includes(newAddress)) {
            toast('Address already in blacklist')
            return
        }
        updateConfig({
            blacklist: [...config.blacklist, newAddress],
        })
        setNewAddress('')
    }

    const removeBlacklistItem = (address: string) => {
        const newBlacklist = config.blacklist.filter((item) => item !== address)
        updateConfig({ blacklist: newBlacklist })
    }

    const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (e) => {
            const content = e.target?.result as string
            const lines = content.split('\n')
            const newAddresses = lines
                .map((line) => line.trim())
                .filter((address) => isAddress(address) && !config.blacklist.includes(address))

            if (newAddresses.length > 0) {
                updateConfig({
                    blacklist: [...config.blacklist, ...newAddresses],
                })
                toast(`Added ${newAddresses.length} new addresses to blacklist`)
            } else {
                toast('No new valid addresses found in CSV')
            }
        }

        reader.readAsText(file)
        event.target.value = ''
    }

    return (
        <div className="space-y-4">
            <div className="max-h-60 overflow-y-auto space-y-2">
                {config.blacklist.map((address, index) => (
                    <div
                        key={index}
                        className="flex items-center justify-between bg-secondary p-2 rounded"
                    >
                        <span className="text-sm font-mono">{address}</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeBlacklistItem(address)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>
            <div className="flex gap-2 flex-col">
                <Label htmlFor="new-blacklist-address">New Blacklist Address</Label>
                <div className="flex-grow flex w-full gap-2 items-center">
                    <Input
                        id="new-blacklist-address"
                        value={newAddress}
                        onChange={(e) => setNewAddress(e.target.value)}
                        placeholder="Enter address"
                    />
                    <Button onClick={addBlacklistItem} className="self-center">
                        Add
                    </Button>
                </div>
            </div>
            <div className="text-center mx-auto w-full">OR</div>
            <div>
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleCsvUpload}
                    ref={fileInputRef}
                    className="hidden"
                />
                <Button onClick={() => fileInputRef.current?.click()} className="w-full">
                    Upload CSV
                </Button>
            </div>
            <div className="text-center mx-auto w-full">OR</div>
            <Textarea
                placeholder="Paste multiple addresses here (separated by a comma)"
                className="h-24"
                onBlur={(e) => {
                    const addresses = e.target.value.split(',').map((addr) => addr.trim())
                    const validAddresses = addresses.filter(
                        (addr) => isAddress(addr) && !config.blacklist.includes(addr)
                    )
                    if (validAddresses.length > 0) {
                        updateConfig({
                            blacklist: [...config.blacklist, ...validAddresses],
                        })
                        e.target.value = ''
                        toast(`Added ${validAddresses.length} new addresses to blacklist`)
                    }
                }}
            />
        </div>
    )
}

function GeneralSection() {
    const [config, updateConfig] = useFrameConfig<Config>()
    const chainName = config.chain === 'ethereum' ? 'mainnet' : config.chain
    const tokenAddress = config.tokenAddress as Address
    const crossTokenKey = `${chainName}/${tokenAddress}`

    const [availableTokens, uniqueChains] = (() => {
        if (!config.crossTokens || !tokenAddress || !config.chain || !isAddress(tokenAddress)) {
            return [{}, []]
        }

        const allTokens = config.crossTokens[crossTokenKey]

        if (!allTokens) {
            return [{}, []]
        }
        //Remove native tokens because there's no way to do transferFrom with native tokens. Only leave erc20 tokens. See /handlers/tx for approval code
        const erc20tokens = allTokens.filter((token) => !token.paymentCurrency.includes('slip44'))

        const uniqueChains = [...new Set(erc20tokens.map((token) => token.chainName.toLowerCase()))]

        const reducedTokens = erc20tokens.reduce(
            (acc, token) => {
                const tokenChain = token.chainName.toLowerCase()
                if (!acc[tokenChain]) {
                    acc[tokenChain] = []
                }
                acc[tokenChain].push(token)
                return acc
            },
            {} as Record<string, typeof erc20tokens>
        )

        return [reducedTokens, uniqueChains]
    })()

    const currentTokens = availableTokens?.[config.crossToken?.chain]

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold">Token Contract Address</h2>
                <Input
                    className="text-lg flex-1 h-10"
                    placeholder="0x...."
                    defaultValue={config.tokenAddress}
                    onChange={async (e) => {
                        const tokenAddress = e.target.value.trim()
                        if (!(tokenAddress && chainName && isAddress(tokenAddress))) return
                        const details = await getContractDetails(chainName, tokenAddress as Address)
                        if (!details) {
                            toast.error(
                                `Could not fetch token ${tokenAddress} on ${config.chain} chain`
                            )
                        }
                        updateConfig({
                            tokenAddress,
                            tokenName: details?.name ?? '',
                            tokenSymbol: details?.symbol ?? '',
                            crossToken: !details
                                ? {
                                      chain: '',
                                      symbol: '',
                                  }
                                : config.crossToken,
                        })
                    }}
                />
                <small className="text-green-600 bold px-2">{config.tokenName}</small>
            </div>
            <div className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold">Chain</h2>
                <Select
                    defaultValue={config.chain}
                    onChange={async (value) => {
                        const chain = value === 'ethereum' ? 'mainnet' : value
                        if (!(tokenAddress && chain && isAddress(tokenAddress))) {
                            toast.error('Token Address must be an address')
                            return
                        }
                        const details = await getContractDetails(
                            chain as typeof chainName,
                            tokenAddress as Address
                        )
                        if (!details) {
                            toast.error(`Could not fetch token ${tokenAddress} on ${value} chain`)
                        }
                        updateConfig({
                            chain: value,
                            tokenName: details?.name ?? '',
                            tokenSymbol: details?.symbol ?? '',
                            crossToken: !details
                                ? {
                                      chain: '',
                                      symbol: '',
                                  }
                                : config.crossToken,
                            crossTokenEnabled: details ? config.crossTokenEnabled : false,
                        })
                    }}
                >
                    {Object.keys(airdropChains).map((option) => (
                        <option key={option} value={option}>
                            {option[0].toUpperCase() + option.slice(1)}
                        </option>
                    ))}
                </Select>
            </div>
            {config.tokenName && config.tokenSymbol && (
                <div className="flex items-center pt-4 gap-2">
                    <Switch
                        disabled={!(chainName && tokenAddress)}
                        id="cross-token"
                        checked={config.crossTokenEnabled}
                        onCheckedChange={async (checked) => {
                            if (
                                checked &&
                                !(chainName && tokenAddress && isAddress(tokenAddress))
                            ) {
                                toast.error('Please select a chain and add token address')
                                return
                            }
                            const crossTokenKey = `${chainName}/${tokenAddress}`
                            let crossTokenDetails = config.crossTokens?.[crossTokenKey]

                            if (!crossTokenDetails || crossTokenDetails.length === 0) {
                                crossTokenDetails = await getCrossChainTokenDetails(
                                    chainName,
                                    tokenAddress,
                                    config.tokenSymbol
                                )
                                if (!crossTokenDetails || crossTokenDetails.length === 0) {
                                    toast.error('Failed to fetch cross-chain token details')
                                    return
                                }

                                updateConfig({
                                    crossTokenEnabled: checked,
                                    crossTokens: {
                                        ...config.crossTokens,
                                        [crossTokenKey]: crossTokenDetails,
                                    },
                                })
                                return
                            }
                            updateConfig({
                                crossTokenEnabled: checked,
                            })
                        }}
                    />
                    <Label htmlFor="cross-token">Cross token Payment</Label>
                </div>
            )}
            {config.crossTokenEnabled && uniqueChains.length > 0 && (
                <div className="flex flex-col gap-4 py-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="cross-token">Cross Token Chain</Label>
                        <Select
                            defaultValue={config.crossToken?.chain ?? ''}
                            onChange={async (value) => {
                                updateConfig({
                                    crossToken: {
                                        chain: value as keyof typeof airdropChains,
                                    },
                                })
                            }}
                        >
                            {uniqueChains.map((option) => (
                                <option key={option} value={option}>
                                    {option[0].toUpperCase() + option.slice(1)}
                                </option>
                            ))}
                        </Select>
                    </div>

                    {currentTokens && currentTokens.length > 0 && (
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="cross-token-symbol">Cross Token Symbol</Label>
                            <Select
                                defaultValue={config.crossToken?.symbol ?? ''}
                                onChange={async (value) => {
                                    if (!config.crossToken.chain) return
                                    updateConfig({
                                        crossToken: {
                                            chain: config.crossToken.chain,
                                            symbol: value as keyof typeof airdropChains,
                                        },
                                    })
                                }}
                            >
                                {currentTokens.map((option) => (
                                    <option
                                        key={option.currencySymbol}
                                        value={option.currencySymbol}
                                    >
                                        {option.currencyName} {option.currencySymbol}
                                    </option>
                                ))}
                            </Select>
                        </div>
                    )}
                    {config.crossToken.chain && config.crossToken.symbol && (
                        <div className="text-sm text-gray-100">
                            You're paying with{' '}
                            <span className="text-green-300">{config.crossToken.symbol}</span> on{' '}
                            <span className="text-green-300">{config.crossToken.chain}</span> and
                            users receive{' '}
                            <span className="text-green-500">{config.tokenSymbol}</span> on{' '}
                            <span className="text-green-500">{config.chain} </span>
                        </div>
                    )}
                </div>
            )}
            <div className="flex flex-col gap-2">
                <h2>Airdropper Address</h2>
                <Input
                    className="text-lg flex-1 h-10"
                    placeholder="Your address with the tokens"
                    defaultValue={config.walletAddress}
                    onChange={(e) =>
                        updateConfig({
                            walletAddress: e.target.value,
                        })
                    }
                />
            </div>
            <div className="flex flex-col gap-2">
                <h2>Amount Per User</h2>
                <Input
                    className="text-lg flex-1 h-10"
                    placeholder="Amount"
                    defaultValue={config.generalAmount}
                    onChange={(e) => {
                        if (isNaN(Number(e.target.value))) {
                            return
                        }
                        updateConfig({
                            generalAmount: Number(e.target.value),
                        })
                    }}
                />
            </div>
            <div className="flex flex-col gap-2">
                <h2>Cooldown Time (in seconds)</h2>
                <Input
                    className="text-lg flex-1 h-10"
                    placeholder="Amount"
                    defaultValue={config.cooldown}
                    onChange={(e) => {
                        let value = e.target.value
                        if (isNaN(Number(value)) || Number(value) < -1) {
                            value = '-1'
                        }
                        updateConfig({
                            cooldown: Number(value),
                        })
                    }}
                />
            </div>
        </div>
    )
}

function WhiteListSection() {
    const [config, updateConfig] = useFrameConfig<Config>()
    const [newAddress, setNewAddress] = useState('')
    const [newAmount, setNewAmount] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)

    const addWhitelistItem = () => {
        if (!isAddress(newAddress)) {
            toast('Invalid address')
            return
        }
        const amount = Number(newAmount) || config.generalAmount
        updateConfig({
            whitelist: [...config.whitelist, { address: newAddress, amount }],
        })
        setNewAddress('')
        setNewAmount('')
    }

    const removeWhitelistItem = (index: number) => {
        const newWhitelist = config.whitelist.filter((_, i) => i !== index)
        updateConfig({ whitelist: newWhitelist })
    }

    const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (e) => {
            const content = e.target?.result as string
            const lines = content.split('\n')
            const newPairs: WhiteList[] = []

            for (const line of lines) {
                const [address, amount] = line.split(',').map((item) => item.trim())
                if (isAddress(address)) {
                    newPairs.push({
                        address,
                        amount: Number(amount) || config.generalAmount,
                    })
                }
            }

            updateConfig({
                whitelist: [...config.whitelist, ...newPairs],
            })
        }

        reader.readAsText(file)
        event.target.value = ''
    }

    return (
        <div className="space-y-4">
            {config.whitelist?.map((item, index) => (
                <div key={index} className="flex flex-col space-y-2">
                    <div className="flex gap-2">
                        <div className="w-full">
                            <Label htmlFor={`address-${index}`}>Address</Label>
                            <Input
                                id={`address-${index}`}
                                value={item.address}
                                readOnly={true}
                                disabled={true}
                            />
                        </div>
                        <div>
                            <Label htmlFor={`amount-${index}`}>Amount</Label>
                            <Input
                                id={`amount-${index}`}
                                value={item.amount}
                                readOnly={true}
                                disabled={true}
                            />
                        </div>
                    </div>
                    <Button variant="destructive" onClick={() => removeWhitelistItem(index)}>
                        Remove
                    </Button>
                </div>
            ))}
            <div className="flex flex-col space-y-2">
                <div className="flex gap-2">
                    <div className="w-full">
                        <Label htmlFor="new-address">New Address</Label>
                        <Input
                            id="new-address"
                            value={newAddress}
                            onChange={(e) => setNewAddress(e.target.value)}
                            placeholder="Enter address"
                        />
                    </div>
                    <div>
                        <Label htmlFor="new-amount">New Amount</Label>
                        <Input
                            id="new-amount"
                            value={newAmount}
                            onChange={(e) => setNewAmount(e.target.value)}
                            placeholder="Enter amount (optional)"
                        />
                    </div>
                </div>
                <Button onClick={addWhitelistItem}>Add New Address</Button>
            </div>
            <div className="text-center mx-auto w-full">OR</div>
            <div>
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleCsvUpload}
                    ref={fileInputRef}
                    className="hidden"
                />
                <Button className="w-full" onClick={() => fileInputRef.current?.click()}>
                    Upload CSV
                </Button>
            </div>
        </div>
    )
}

function ButtonsSection() {
    const [config, updateConfig] = useFrameConfig<Config>()
    const frameId = useFrameId()
    const buttons = config.buttons

    const addButton = () => {
        const buttonsIndex = buttons.length + 2
        const newButton: LinkButton = {
            action: 'link',
            label: 'button ' + buttonsIndex,
            target: 'https://frametra.in/frame/' + frameId,
        }
        updateConfig({ buttons: [...buttons, newButton] })
    }

    const removeButton = (index: number) => {
        const newButtons = buttons.filter((_, i) => i !== index) as Config['buttons']
        updateConfig({ buttons: newButtons })
    }

    function isValidUrl(url: string) {
        try {
            new URL(url)
            return true
        } catch (e) {
            return false
        }
    }

    const handleInputChange = (index: number, field: 'target' | 'label', value: string) => {
        const newButtons = [...buttons] as Config['buttons']
        newButtons[index][field] = value
        updateConfig({ buttons: newButtons })
    }

    return (
        <div className="flex flex-col gap-4">
            {buttons.map((button, index) => (
                <div key={index} className="flex flex-col space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                            <Label htmlFor={`target-${index}`}>Target</Label>
                            <Input
                                id={`target-${index}`}
                                defaultValue={button.target}
                                onChange={(e) => handleInputChange(index, 'target', e.target.value)}
                                placeholder="External URL"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`label-${index}`}>Label</Label>
                            <Input
                                id={`label-${index}`}
                                defaultValue={button.label}
                                onChange={(e) => handleInputChange(index, 'label', e.target.value)}
                                placeholder="Label"
                            />
                        </div>
                    </div>
                    <Button variant="destructive" onClick={() => removeButton(index)}>
                        Remove
                    </Button>
                </div>
            ))}
            {buttons.length < 3 && <Button onClick={addButton}>Add New Button</Button>}
        </div>
    )
}

function AppearanceSection() {
    const [config, updateConfig] = useFrameConfig<Config>()
    const uploadImage = useUploadImage()

    return (
        <>
            <div className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold">Background</h2>
                <ColorPicker
                    className="w-full"
                    enabledPickers={['solid', 'gradient', 'image']}
                    background={config.cover.background}
                    setBackground={(value) => {
                        const newCover = { ...config.cover, background: value }
                        updateConfig({ cover: newCover })
                    }}
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
                <h2 className="text-lg font-semibold">Header Text</h2>
                <Input
                    className="w-full"
                    defaultValue={config.cover.headerText}
                    onChange={(e) => {
                        const newCover = { ...config.cover, headerText: e.target.value }
                        updateConfig({
                            cover: newCover,
                        })
                    }}
                />
            </div>
            <div className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold">Header Color</h2>
                <ColorPicker
                    className="w-full"
                    background={config.cover.headerColor}
                    setBackground={(value) => {
                        const newCover = { ...config.cover, headerColor: value }
                        updateConfig({ cover: newCover })
                    }}
                />
            </div>
            <div className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold">SubHeader Text</h2>
                <Input
                    className="w-full"
                    defaultValue={config.cover.subHeaderText}
                    onChange={(e) => {
                        const newCover = { ...config.cover, subHeaderText: e.target.value }
                        updateConfig({ cover: newCover })
                    }}
                />
            </div>
            <div className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold">Sub Header Color</h2>
                <ColorPicker
                    className="w-full"
                    background={config.cover.subHeaderColor}
                    setBackground={(value) => {
                        const newCover = { ...config.cover, subHeaderColor: value }
                        updateConfig({ cover: newCover })
                    }}
                />
            </div>
        </>
    )
}
