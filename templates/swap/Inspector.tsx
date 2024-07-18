'use client'
import { Input } from '@/components/shadcn/Input'
import { useFrameConfig } from '@/sdk/hooks'
import { useEffect, useRef } from 'react'
import type { Config } from '.'
import { getPoolData } from './utils/uniswap'
import toast from 'react-hot-toast'
import { Label } from '@/components/shadcn/InputLabel'
import { Switch } from '@/components/shadcn/Switch'

export default function Inspector() {
    const [config, updateConfig] = useFrameConfig<Config>()

    const poolAddressInputRef = useRef<HTMLInputElement>(null)
    const amountInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (!poolAddressInputRef.current) return
        if (!config.pool?.address) return

        poolAddressInputRef.current.value = config.pool.address
    }, [config.pool?.address])

    return (
        <div className=" h-full flex flex-col gap-10">
            <div>{JSON.stringify(config, null, 2)}</div>
            <div className="w-full h-full flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-semibold">Uniswap Pool address</h2>
                    <Input
                        className="py-2 text-lg"
                        defaultValue={config.pool ? `${config.pool.address}` : undefined}
                        onChange={async (e) => {
                            const poolAddress = e.target.value.trim().toLowerCase()

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
                                })

                                toast.success(`Client found on chain ${pool.chain}`)
                            } catch (e) {
                                const error = e as Error
                                toast.error(error.message)
                            }
                        }}
                    />
                </div>

                {config.pool ? (
                    <div className="flex justify-between w-full">
                        <div className="flex justify-start items-center gap-3">
                            <div className="relative">
                                <img
                                    src={`https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${config.pool.token0.address}/logo.png`}
                                    alt={config.pool.token0.symbol}
                                    className="w-8 h-8 rounded-full"
                                />
                            </div>
                        </div>
                    </div>
                ) : null}

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
                                    updateConfig({ enablePredefinedAmounts: checked })
                                }}
                            />
                        </div>
                    </div>

                    {config.enablePredefinedAmounts ? (
                        <div className="flex flex-col gap-2">
                            <h2 className="text-2xl font-semibold">Predefined amounts</h2>

                            <div className="flex flex-col gap-2">
                                <div className="flex flex-row w-full gap-2">
                                    <label className="block uppercase tracking-wide text-gray-200 text-xs font-bold mb-2">
                                        Amount
                                    </label>
                                    <Input
                                        type="number"
                                        className="text-lg"
                                        placeholder="50"
                                        ref={amountInputRef}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    )
}
