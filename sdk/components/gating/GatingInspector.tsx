'use client'
import { BaseInput } from '@/components/shadcn/BaseInput'
import { Button } from '@/components/shadcn/Button'
import { Checkbox } from '@/components/shadcn/Checkbox'
import { Label } from '@/components/shadcn/Label'
import { Slider } from '@/components/shadcn/Slider'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/shadcn/Table'
import { getViemClient } from '@/lib/gating'
import { Select } from '@/sdk/components/Select'
import { Trash2 } from 'lucide-react'
import NextLink from 'next/link'
import { type ReactNode, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { erc20Abi, getAddress, getContract } from 'viem'
import type { GATING_ALL_OPTIONS } from './constants'
import type { GatingErcType, GatingType } from './types'

const ErcGating = ({
    onChange,
    config,
    erc,
}: {
    onChange: (v: GatingErcType[]) => void
    config: GatingErcType[] | undefined
    erc: '721' | '1155' | '20'
}) => {
    return (
        <div className="flex flex-col gap-2">
            {Boolean(config?.length) && (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{erc === '20' ? 'Token' : 'Collection'}</TableHead>
                            <TableHead>Min Balance</TableHead>
                            {erc === '1155' && <TableHead>ID</TableHead>}
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {config?.map((group) => (
                            <TableRow key={group.address}>
                                <TableCell className="font-medium">
                                    {group.symbol} on {group.network}
                                </TableCell>
                                <TableCell>{group.balance}</TableCell>
                                {erc === '1155' && <TableCell>{group.tokenId}</TableCell>}
                                <TableCell className="flex flex-row justify-end gap-2">
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => {
                                            alert(group.address)
                                            onChange(
                                                config.filter(
                                                    (c) =>
                                                        c.address.toLowerCase() !==
                                                        group.address.toLowerCase()
                                                )
                                            )
                                        }}
                                    >
                                        <Trash2 />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
            <form
                className="flex flex-col gap-2"
                onSubmit={async (e) => {
                    e.preventDefault()

                    const network = e.currentTarget.network.value
                    const address = e.currentTarget.address.value
                    const balance = e.currentTarget.balance.value || 1
                    const tokenId = erc === '1155' ? e.currentTarget.tokenId.value : undefined

                    let symbol: string | undefined

                    try {
                        const token = getContract({
                            client: getViemClient(network),
                            address: getAddress(address),
                            abi: erc20Abi,
                        })

                        if (config?.find((c) => c.address === address)) {
                            toast.error('This token has already been added!')
                            return
                        }

                        symbol = await token.read.symbol()
                    } catch {
                        toast.error(
                            'Could not fetch contract data, are you sure this is a valid address?'
                        )
                        return
                    }

                    onChange([
                        ...(config || []),
                        {
                            network,
                            address,
                            symbol,
                            balance,
                            tokenId,
                        },
                    ])

                    e.currentTarget.reset()
                }}
            >
                <div className="flex flex-row items-center w-full gap-2">
                    <Label htmlFor="network" className="text-sm font-medium leading-none w-20">
                        Network
                    </Label>
                    <Select id="network" required={true}>
                        <option value="ETH">Mainnet</option>
                        <option value="BASE">Base</option>
                        <option value="OP">Optimism</option>
                        <option value="ZORA">Zora</option>
                        <option value="BLAST">Blast</option>
                        <option value="POLYGON">Polygon</option>
                        <option value="FANTOM">Fantom</option>
                        <option value="ARBITRUM">Arbitrum</option>
                        <option value="BNB">BNB</option>
                    </Select>
                </div>
                <div className="flex flex-row items-center w-full gap-2">
                    <Label htmlFor="address" className="text-sm font-medium leading-none w-20">
                        Contract
                    </Label>
                    <BaseInput
                        id="address"
                        type="text"
                        placeholder="0x8c678ghybv...."
                        required={true}
                    />
                </div>
                <div className="flex flex-row items-center w-full gap-2">
                    <Label htmlFor="balance" className="text-sm font-medium leading-none">
                        Min Balance
                    </Label>
                    <BaseInput
                        id="balance"
                        type="number"
                        placeholder="300 for 300 USDC (optional)"
                    />
                </div>
                {erc === '1155' ? (
                    <div className="flex flex-row items-center w-full gap-2">
                        <Label htmlFor="tokenId" className="text-sm font-medium leading-none w-20">
                            Token ID
                        </Label>
                        <BaseInput id="tokenId" type="text" placeholder="1" />
                    </div>
                ) : null}
                <Button type="submit" className="w-full" size={'lg'}>
                    Add
                </Button>
            </form>
        </div>
    )
}

export default function GatingInspector({
    config,
    onUpdate,
    fid,
    disabledOptions = [],
}: {
    config: GatingType | undefined
    onUpdate: (newConfig: Partial<GatingType>) => void
    fid: string
    disabledOptions?: typeof GATING_ALL_OPTIONS
}) {
    const [enabledOptions, setEnabledOptions] = useState<
        Record<(typeof GATING_ALL_OPTIONS)[number], boolean>
    >({
        liked: Boolean(config?.enabled.includes('liked')),
        recasted: Boolean(config?.enabled.includes('recasted')),
        followedByMe: Boolean(config?.enabled.includes('followedByMe')),
        followingMe: Boolean(config?.enabled.includes('followingMe')),
        eth: Boolean(config?.enabled.includes('eth')),
        sol: Boolean(config?.enabled.includes('sol')),
        channels: Boolean(config?.enabled.includes('channels')),
        maxFid: Boolean(config?.enabled.includes('maxFid')),
        minFid: Boolean(config?.enabled.includes('minFid')),
        exactFids: Boolean(config?.enabled.includes('exactFids')),
        score: Boolean(config?.enabled.includes('score')),
        erc721: Boolean(config?.enabled.includes('erc721')),
        erc1155: Boolean(config?.enabled.includes('erc1155')),
        erc20: Boolean(config?.enabled.includes('erc20')),
    })

    const options = useMemo<
        {
            key: (typeof GATING_ALL_OPTIONS)[number]
            label: string
            children?: ReactNode
            disabled?: boolean | undefined
        }[]
    >(
        () => [
            {
                key: 'liked',
                label: 'Must Like',
            },
            {
                key: 'recasted',
                label: 'Must Recast',
            },
            {
                key: 'followingMe',
                label: 'Must Follow Me',
            },
            {
                key: 'followedByMe',
                label: 'Must be Someone I Follow',
            },
            {
                key: 'eth',
                label: 'Must have ETH Address Setup',
            },
            {
                key: 'sol',
                label: 'Must have SOL Address Setup',
            },
            {
                key: 'minFid',
                label: 'FID must be greater than',
                disabled: config?.enabled.includes('exactFids'),
                children: (
                    <div className="flex flex-row items-center">
                        <Label htmlFor="fid" className="text-sm font-medium leading-none w-1/2">
                            Min FID:
                        </Label>
                        <BaseInput
                            id="fid"
                            type="number"
                            min={1}
                            placeholder="FID (e.g. 175287)"
                            defaultValue={config?.requirements?.minFid}
                            className="w-full"
                            onChange={(e) => {
                                const value = e.target.value
                                const minFid = value === '' ? 0 : Number(value)
                                onUpdate({
                                    requirements: {
                                        ...(config?.requirements || {}),
                                        minFid,
                                    },
                                })
                            }}
                        />
                    </div>
                ),
            },
            {
                key: 'maxFid',
                label: 'FID must be less than',
                disabled: config?.enabled.includes('exactFids'),
                children: (
                    <div className="flex flex-row items-center">
                        <Label htmlFor="fid" className="text-sm font-medium leading-none w-1/2">
                            Max FID:
                        </Label>
                        <BaseInput
                            id="fid"
                            type="number"
                            min={1}
                            className="w-full"
                            placeholder="FID (e.g. 175287)"
                            defaultValue={config?.requirements?.maxFid}
                            onChange={(e) => {
                                const value = e.target.value
                                const maxFid = value === '' ? 0 : Number(value)
                                onUpdate({
                                    requirements: {
                                        ...(config?.requirements || {}),
                                        maxFid,
                                    },
                                })
                            }}
                        />
                    </div>
                ),
            },
            {
                key: 'exactFids',
                label: 'FID(s) must be exactly',
                disabled: config?.enabled.includes('minFid') || config?.enabled.includes('maxFid'),
                children: (
                    <div className="flex flex-col gap-2">
                        {Boolean(config?.requirements?.exactFids?.length) && (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>FID</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {config?.requirements.exactFids!.map((fid) => (
                                        <TableRow key={fid}>
                                            <TableCell>{fid}</TableCell>
                                            <TableCell className="flex flex-row justify-end gap-2">
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() =>
                                                        onUpdate({
                                                            requirements: {
                                                                ...(config?.requirements || {}),
                                                                exactFids:
                                                                    config.requirements.exactFids!.filter(
                                                                        (f) => f !== fid
                                                                    ),
                                                            },
                                                        })
                                                    }
                                                >
                                                    <Trash2 />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                        <form
                            key={fid}
                            className="flex flex-row gap-2 w-full items-center"
                            onSubmit={(e) => {
                                e.preventDefault()

                                const fid = Number(e.currentTarget.fid.value)

                                if (config?.requirements.exactFids?.includes(fid)) {
                                    toast.error(`FID ${fid} already exists in the list!`)
                                    return
                                }

                                onUpdate({
                                    requirements: {
                                        ...(config?.requirements || {}),
                                        exactFids: [
                                            ...(config?.requirements?.exactFids || []),
                                            fid,
                                        ],
                                    },
                                })
                            }}
                        >
                            <BaseInput
                                id="fid"
                                type="number"
                                min={1}
                                className="w-full"
                                placeholder="FID (e.g. 175287)"
                            />

                            <Button type="submit" size={'lg'}>
                                Add
                            </Button>
                        </form>
                    </div>
                ),
            },
            {
                key: 'score',
                label: 'Must have Open Rank Engagement Score',

                children: (
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-row items-center w-full">
                            <Label
                                htmlFor="score"
                                className="text-sm font-medium leading-none w-1/2"
                            >
                                Reputation Degree:
                            </Label>
                            <Slider
                                id="score"
                                min={1}
                                max={5}
                                step={1}
                                className="w-full"
                                onValueChange={([score]) => {
                                    onUpdate({
                                        requirements: {
                                            ...(config?.requirements || {}),
                                            score: {
                                                owner: Number.parseInt(fid),
                                                score,
                                            },
                                        },
                                    })
                                }}
                            />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Only users with this degree will be eligible for the rewards. To learn
                            more about Open Rank, visit{' '}
                            <NextLink
                                className="underline"
                                href="https://openrank.com/"
                                target="_blank"
                            >
                                OpenRank
                            </NextLink>
                        </p>
                    </div>
                ),
            },
            {
                key: 'erc721',
                label: 'Must hold ERC-721 NFT(s)',
                children: (
                    <ErcGating
                        erc="721"
                        config={config?.requirements?.erc721}
                        onChange={(erc721) =>
                            onUpdate({
                                requirements: {
                                    ...(config?.requirements || {}),
                                    erc721: erc721,
                                },
                            })
                        }
                    />
                ),
            },
            {
                key: 'erc1155',
                label: 'Must hold ERC-1155 NFT(s)',
                children: (
                    <ErcGating
                        erc="1155"
                        config={config?.requirements.erc1155}
                        onChange={(erc1155) =>
                            onUpdate({
                                requirements: {
                                    ...(config?.requirements || {}),
                                    erc1155: erc1155,
                                },
                            })
                        }
                    />
                ),
            },
            {
                key: 'erc20',
                label: 'Must hold ERC-20 Token(s)',
                children: (
                    <ErcGating
                        erc="20"
                        config={config?.requirements.erc20}
                        onChange={(erc20) =>
                            onUpdate({
                                requirements: {
                                    ...(config?.requirements || {}),
                                    erc20: erc20,
                                },
                            })
                        }
                    />
                ),
            },
        ],
        [config, onUpdate, fid]
    )

    return (
        <div className="flex flex-col gap-4 w-full">
            {options
                .filter((option) => !disabledOptions.includes(option.key))
                .map((option) => (
                    <div key={option.key} className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id={option.key}
                                checked={enabledOptions[option.key]}
                                onCheckedChange={(checked: boolean) => {
                                    onUpdate({
                                        enabled: checked
                                            ? [
                                                  ...(config?.enabled.filter(
                                                      (v) => v !== option.key
                                                  ) || []),
                                                  option.key,
                                              ]
                                            : config?.enabled.filter((v) => v !== option.key),
                                    })

                                    setEnabledOptions({
                                        ...enabledOptions,
                                        [option.key]: checked,
                                    })
                                }}
                                disabled={option.disabled}
                            />
                            <Label
                                htmlFor={option.key}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                {option.label}
                            </Label>
                        </div>
                        {enabledOptions[option.key] && option.children ? (
                            <div className="flex flex-col gap-2 w-full pt-2">{option.children}</div>
                        ) : null}
                    </div>
                ))}
        </div>
    )
}
