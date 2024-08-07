'use client'
import { Button } from '@/components/shadcn/Button'
import { Input } from '@/components/shadcn/Input'
import { useFrameConfig } from '@/sdk/hooks'
import toast from 'react-hot-toast'
import { useDebouncedCallback } from 'use-debounce'
import type { Config } from '.'
import { getContractData } from './common/etherscan'

export default function Inspector() {
    const [config, updateConfig] = useFrameConfig<Config>()

    const onChangeLink = useDebouncedCallback(async (link: string) => {
        if (config.etherscan?.link === link) return

        if (!link.length) {
            updateConfig({ etherscan: null })
            return
        }

        try {
            //
            const etherscan = await getContractData(link)
            updateConfig({ etherscan })

            toast.success('Contract data fetched successfully')
        } catch (e) {
            const error = e as Error
            toast.error(error.message)
        }
    }, 100)

    return (
        <div className="flex flex-col w-full h-full gap-4">
            <div className="flex flex-col gap-2 ">
                <h2 className="text-lg font-semibold">Contract Url:</h2>
                <Input
                    className="text-lg"
                    defaultValue={config.etherscan?.link}
                    type="url"
                    placeholder="https://etherscan.io/address/0xa0b8...9cd"
                    onChange={(e) => onChangeLink(e.target.value)}
                />
            </div>

            {config.etherscan ? (
                <Button
                    variant="destructive"
                    className="w-full "
                    onClick={() => updateConfig({ etherscan: null })}
                >
                    Delete
                </Button>
            ) : null}
        </div>
    )
}
