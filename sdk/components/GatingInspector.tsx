'use client'
import { Button } from '@/components/shadcn/Button'
import { Checkbox } from '@/components/shadcn/Checkbox'
import { Input } from '@/components/shadcn/Input'
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
import { type ReactNode, useMemo } from 'react'
import toast from 'react-hot-toast'
import { erc20Abi, getAddress, getContract } from 'viem'
import { GATING_ALL_OPTIONS } from './gating/constants'

export type GatingErcType = {
    network: string
    address: string
    symbol: string
    balance: number
    tokenId?: number | undefined
}

export type GatingRequirementsType = {
    channels?: string[] | undefined
    minFid?: number | undefined
    maxFid?: number | undefined
    exactFids?: number[] | undefined
    score?: { score: number; owner: number } | undefined
    erc20?: GatingErcType[] | undefined
    erc721?: GatingErcType[] | undefined
    erc1155?: GatingErcType[] | undefined
}

export type GatingType = {
    enabled: string[]
    requirements: GatingRequirementsType
}

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
                                    onClick={() =>
                                        onChange(config.filter((c) => c.address !== group.address))
                                    }
                                >
                                    <Trash2 />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
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
                    <Input
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
                    <Input id="balance" type="number" placeholder="300 for 300 USDC (optional)" />
                </div>
                {erc === '1155' ? (
                    <div className="flex flex-row items-center w-full gap-2">
                        <Label htmlFor="tokenId" className="text-sm font-medium leading-none w-20">
                            Token ID
                        </Label>
                        <Input id="tokenId" type="text" placeholder="1" />
                    </div>
                ) : null}
                <Button type="submit" className="w-full">
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
}: {
    config: GatingType | undefined
    onUpdate: (newConfig: Partial<GatingType>) => void
    fid: string
}) {
    const enabledOptions = useMemo(() => {
        return {
            ...GATING_ALL_OPTIONS.map((key) => ({
                [key]: config?.enabled.includes(key),
                // biome-ignore lint/performance/noAccumulatingSpread: <explanation>
            })).reduce((a, b) => ({ ...a, ...b }), {}),
        } as Record<(typeof GATING_ALL_OPTIONS)[number], boolean>
    }, [config])

    const options = useMemo<
        {
            key: keyof typeof enabledOptions
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
                disabled: enabledOptions.exactFids,
                children: (
                    <>
                        <div className="flex flex-row items-center">
                            <Label htmlFor="fid" className="text-sm font-medium leading-none w-1/2">
                                Min FID:
                            </Label>
                            <Input
                                id="fid"
                                type="number"
                                min={1}
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
                        <p className="text-sm text-muted-foreground">
                            Only users with FID greater than this value will be able eligible for
                            the rewards
                        </p>
                    </>
                ),
            },
            {
                key: 'maxFid',
                label: 'FID must be less than',
                disabled: enabledOptions.exactFids,
                children: (
                    <>
                        <div className="flex flex-row items-center">
                            <Label htmlFor="fid" className="text-sm font-medium leading-none w-1/2">
                                Max FID:
                            </Label>
                            <Input
                                id="fid"
                                type="number"
                                min={1}
                                className="w-full"
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
                        <p className="text-sm text-muted-foreground">
                            Only users with FID less than this value will be able eligible for the
                            rewards
                        </p>
                    </>
                ),
            },
            {
                key: 'exactFids',
                label: 'FID(s) must be exactly',
                disabled: enabledOptions.minFid || enabledOptions.maxFid,
                children: (
                    <>
                        {config?.requirements?.exactFids?.map((fid) => (
                            <div key={fid} className="flex flex-col">
                                <div className="flex flex-row items-center">
                                    <Label
                                        htmlFor="fid"
                                        className="text-sm font-medium leading-none w-1/2"
                                    >
                                        FID:
                                    </Label>
                                    <Input
                                        id="fid"
                                        type="number"
                                        min={1}
                                        className="w-full"
                                        onChange={(e) => {
                                            const value = e.target.value

                                            const exactFid = value === '' ? 0 : Number(value)

                                            if (config.requirements.exactFids?.includes(exactFid)) {
                                                toast.error(
                                                    `FID ${exactFid} already exists in the list!`
                                                )
                                                return
                                            }

                                            onUpdate({
                                                requirements: {
                                                    ...(config?.requirements || {}),
                                                    exactFids: [
                                                        ...(config?.requirements?.exactFids || []),
                                                        exactFid,
                                                    ],
                                                },
                                            })
                                        }}
                                    />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Only this FID is eligible for the rewards.
                                </p>
                            </div>
                        ))}
                    </>
                ),
            },
            {
                key: 'score',
                label: 'Must have Open Rank Engagement Score',

                children: (
                    <>
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
                    </>
                ),
            },
            {
                key: 'erc721',
                label: 'Must hold ERC-721 NFT(s)',
                children: (
                    <ErcGating
                        erc="721"
                        config={config?.requirements?.erc721}
                        onChange={(erc721) => {
                            onUpdate({
                                requirements: {
                                    ...(config?.requirements || {}),
                                    erc721: [...(config?.requirements?.erc721 || []), ...erc721],
                                },
                            })
                        }}
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
                        onChange={(erc1155) => {
                            onUpdate({
                                requirements: {
                                    ...(config?.requirements || {}),
                                    erc1155: [...(config?.requirements?.erc1155 || []), ...erc1155],
                                },
                            })
                        }}
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
                        onChange={(erc20) => {
                            onUpdate({
                                requirements: {
                                    ...(config?.requirements || {}),
                                    erc20: [...(config?.requirements?.erc20 || []), ...erc20],
                                },
                            })
                        }}
                    />
                ),
            },
        ],
        [config, onUpdate, enabledOptions, fid]
    )

    return (
        <div className="flex flex-col gap-4 w-full">
            {options.map((option) => (
                <div key={option.key} className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id={option.key}
                            checked={enabledOptions[option.key]}
                            onCheckedChange={(checked: boolean) =>
                                onUpdate({
                                    enabled: checked
                                        ? [
                                              ...(config?.enabled.filter((v) => v !== option.key) ||
                                                  []),
                                              option.key,
                                          ]
                                        : config?.enabled.filter((v) => v !== option.key),
                                })
                            }
                            disabled={option.disabled}
                        />
                        <Label
                            htmlFor={option.key}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            {option.label}
                        </Label>
                    </div>
                    {enabledOptions?.[option.key] && option.children ? (
                        <div className="flex flex-col gap-2 w-full">{option.children}</div>
                    ) : null}
                </div>
            ))}
        </div>
    )
}
