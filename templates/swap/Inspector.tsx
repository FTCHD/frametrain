'use client'
import { Avatar, AvatarImage } from '@/components/shadcn/Avatar'
import { Button } from '@/components/shadcn/Button'
import { Input } from '@/components/shadcn/Input'
import { Label } from '@/components/shadcn/InputLabel'
import { Switch } from '@/components/shadcn/Switch'
import { useFrameConfig } from '@/sdk/hooks'
import { Trash } from 'lucide-react'
import Image from 'next/image'
import type { AnchorHTMLAttributes, FC } from 'react'
import { useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import type { Config, PoolToken } from '.'
import { cloudinaryLogoImageLoader, formatSymbol, generateTokenLogoUrl } from './utils/shared'
import { getPoolData } from './utils/uniswap'
import { ToggleGroup, ToggleGroupItem } from '@/components/shadcn/ToggleGroup'
import { supportedChains } from './utils/viem'

export default function Inspector() {
    const [config, updateConfig] = useFrameConfig<Config>()

    const poolAddressInputRef = useRef<HTMLInputElement>(null)
    const amountInputRef = useRef<HTMLInputElement>(null)
    const amounts = config.amounts || []

    const disableAmountsField = amounts.length >= 3

    useEffect(() => {
        if (!poolAddressInputRef.current) return
        if (!config.pool?.address) return

        poolAddressInputRef.current.value = config.pool.address
    }, [config.pool?.address])

    const LinkExternal: FC<AnchorHTMLAttributes<HTMLAnchorElement>> = ({
        target = '_blank',
        rel = 'noopener noreferrer',
        ...props
    }) => {
        return (
            <a
                {...props}
                target={target}
                rel={rel}
                className="cursor-pointer text-blue-500 hover:underline"
            />
        )
    }

    const TokenImage = ({
        token,
        networkId,
        isLast = false,
    }: {
        token: PoolToken
        networkId: number
        isLast?: boolean
    }) => {
        return (
            <div
                className="rounded-full inline-flex z-10 border-2 ring-gray-50 dark:ring-slate-950"
                style={{ marginLeft: isLast ? -36 / 3 : 0 }}
            >
                <Avatar style={{ width: 36, height: 36 }}>
                    <AvatarImage
                        src={generateTokenLogoUrl(networkId, token.address)}
                        asChild={true}
                    >
                        <Image
                            loader={cloudinaryLogoImageLoader}
                            alt="avatar"
                            src={`tokens/${networkId}/${token.address}.jpg`}
                            width={36}
                            height={36}
                        />
                    </AvatarImage>
                </Avatar>
            </div>
        )
    }

    return (
        <div className=" h-full flex flex-col gap-10">
            <div className="w-full h-full flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-semibold">Uniswap Pool address</h2>
                    <Input
                        className="py-2 text-lg"
                        defaultValue={config.pool ? `${config.pool.address}` : undefined}
                        onChange={async (e) => {
                            const poolAddress = e.target.value.trim().toLowerCase()

                            if (poolAddress === config.pool?.address) return

                            if (poolAddress === '') {
                                updateConfig({ pool: null, enablePredefinedAmounts: false })
                                return
                            }

                            try {
                                const pool = await getPoolData(poolAddress as `0x${string}`)

                                updateConfig({
                                    network: pool.network,
                                    pool: {
                                        address: poolAddress,
                                        network: pool.network,
                                        token0: pool.token0,
                                        token1: pool.token1,
                                    },
                                    enablePredefinedAmounts: false,
                                    primary: 'token0',
                                })

                                toast.success(`Client found on chain ${pool.chain}`)
                            } catch (e) {
                                const error = e as Error
                                toast.error(error.message)
                            }
                        }}
                    />

                    <p className="text-sm text-muted-foreground">
                        Only the following networks are supported: {supportedChains}
                    </p>
                </div>

                {config.pool ? (
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <h2 className="text-xl font-semibold">
                                Tokens on ({config.pool.network.name})
                            </h2>

                            <div className="relative flex items-center gap-3 max-w-[100vh]">
                                <LinkExternal
                                    href={`${config.pool.network.explorerUrl}/address/${config.pool.address}`}
                                >
                                    <div className="flex items-center">
                                        <div className="inline-flex">
                                            <TokenImage
                                                token={config.pool.token0}
                                                networkId={config.pool.network.id}
                                            />
                                            <TokenImage
                                                token={config.pool.token1}
                                                networkId={config.pool.network.id}
                                                isLast={true}
                                            />
                                        </div>
                                    </div>
                                </LinkExternal>
                                <ToggleGroup
                                    type="single"
                                    className="flex justify-start gap-2"
                                    defaultValue={config.pool.primary}
                                >
                                    <ToggleGroupItem
                                        value="token0"
                                        className="border-2 border-zinc-600"
                                        onClick={() => {
                                            updateConfig({
                                                pool: {
                                                    ...config.pool,
                                                    primary: 'token0',
                                                },
                                            })
                                        }}
                                    >
                                        {config.pool.token0.symbol}
                                    </ToggleGroupItem>
                                    <ToggleGroupItem
                                        value="token1"
                                        className="border-2 border-zinc-600"
                                        onClick={() => {
                                            updateConfig({
                                                pool: {
                                                    ...config.pool,
                                                    primary: 'token1',
                                                },
                                            })
                                        }}
                                    >
                                        {config.pool.token1.symbol}
                                    </ToggleGroupItem>
                                </ToggleGroup>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                The choosen token will be used as the primary token for the swap
                            </p>
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex flex-row items-center justify-between">
                                <div className="flex flex-row items-center justify-between gap-2 ">
                                    <Label className="font-md" htmlFor="qna-customization">
                                        Enable predefined amounts
                                    </Label>
                                    <Switch
                                        id="qna-customization"
                                        checked={config.enablePredefinedAmounts}
                                        onCheckedChange={(checked) => {
                                            const enablePredefinedAmounts = checked
                                            updateConfig({
                                                enablePredefinedAmounts,
                                                ...(!enablePredefinedAmounts ? { amount: [] } : {}),
                                            })
                                        }}
                                    />
                                </div>
                            </div>

                            {config.enablePredefinedAmounts ? (
                                <div className="flex flex-col gap-2">
                                    <div className="flex flex-col w-full gap-2">
                                        <label className="block uppercase tracking-wide text-gray-200 text-xs font-bold mb-2">
                                            Buying Amount in{' '}
                                            {config.pool.primary === 'token0'
                                                ? config.pool.token1.symbol
                                                : config.pool.token0.symbol}
                                        </label>
                                        <div className="flex flex-row w-full items-center gap-2">
                                            <Input
                                                disabled={disableAmountsField}
                                                ref={amountInputRef}
                                                className="text-lg border rounded py-2 px-4 w-full"
                                                type="number"
                                            />
                                            <Button
                                                type="button"
                                                disabled={disableAmountsField}
                                                className="px-4 py-2 bg-blue-500 text-white rounded-md"
                                                onClick={() => {
                                                    if (!amountInputRef.current) return
                                                    if (config.amounts.length > 3) return

                                                    const amount =
                                                        amountInputRef.current.value.trim()

                                                    if (amount === '') return

                                                    updateConfig({
                                                        amounts: [...config.amounts, amount],
                                                    })

                                                    amountInputRef.current.value = ''
                                                }}
                                            >
                                                Add amount
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <h2 className="text-2xl font-semibold">
                                            Manage Predefined amounts
                                        </h2>
                                        {!amounts.length ? (
                                            <p className="italic text-gray-300">
                                                No Input Field Added yet!
                                            </p>
                                        ) : null}
                                        <div className="w-full flex flex-col gap-2">
                                            {amounts.map((amount, index) => (
                                                <div
                                                    key={index}
                                                    className="flex flex-row items-center justify-between bg-slate-50 bg-opacity-10 p-2 rounded"
                                                >
                                                    <span>
                                                        {index + 1}.{' '}
                                                        {formatSymbol(
                                                            amount,
                                                            config.pool!.primary === 'token0'
                                                                ? config.pool!.token1.symbol
                                                                : config.pool!.token0.symbol
                                                        )}
                                                    </span>
                                                    <Button
                                                        variant={'destructive'}
                                                        onClick={() =>
                                                            updateConfig({
                                                                fields: [
                                                                    ...config.amounts.slice(
                                                                        0,
                                                                        index
                                                                    ),
                                                                    ...config.amounts.slice(
                                                                        index + 1
                                                                    ),
                                                                ],
                                                            })
                                                        }
                                                    >
                                                        <Trash />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    )
}
