'use client'
import { Input } from '@/components/shadcn/Input'
import { useFrameConfig } from '@/sdk/hooks'
import type { Config } from '.'
import { ColorPicker } from '@/sdk/components'
import { useEffect } from 'react'

export default function Inspector() {
    const [config, updateConfig] = useFrameConfig<Config>()

    // Default config
    useEffect(() => {
        updateConfig({
            background: 'linear-gradient(to top left,#ee0979,#ff6a00)',
            message: 'I will pay my tuition fees, please help me <3',
            color: 'white',
        })
    }, [updateConfig])

    return (
        <div className="w-full h-full space-y-4">
            <h3 className="text-lg">
                Wallet Address <small>(Ethereum)</small>
            </h3>
            <Input
                className="text-lg"
                placeholder="Wallet Address"
                defaultValue={config?.address}
                onChange={(e) => {
                    updateConfig({
                        address: e.target.value,
                    })
                }}
            />

            <h3 className="text-lg">
                Message <small>(Optional)</small>
            </h3>
            <textarea
                placeholder="Your Message"
                defaultValue={config?.message}
                className="w-full text-lg p-2 border-input border-[1px] rounded-md bg-transparent resize-y min-h-[184px]"
                onChange={(e) => {
                    updateConfig({
                        message: e.target.value,
                    })
                }}
            />

            <h3 className="text-lg">Background</h3>
            <ColorPicker
                enabledPickers={['solid', 'gradient']}
                className="w-full"
                background={config?.background || 'linear-gradient(to top left,#ee0979,#ff6a00)'}
                setBackground={(value: string) =>
                    updateConfig({
                        background: value,
                    })
                }
            />

            <h3 className="text-lg">Text Color</h3>
            <ColorPicker
                enabledPickers={['solid']}
                className="w-full"
                background={config?.color || 'white'}
                setBackground={(value: string) =>
                    updateConfig({
                        color: value,
                    })
                }
            />
        </div>
    )
}
