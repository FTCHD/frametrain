'use client'
import { Input } from '@/components/shadcn/Input'
import { ColorPicker } from '@/sdk/components'
import { Select } from '@/sdk/components/Select'
import { useFrameConfig, useUploadImage } from '@/sdk/hooks'
import type { Config } from '../..'
import defaultConfig from '../..'

export default function BasicConfig() {
    const [config, updateConfig] = useFrameConfig<Config>()

    const uploadImage = useUploadImage()

    return (
        <div className="flex flex-col gap-4 w-full">
            <div className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold">Allow quiz to be answered only once?</h2>
                <Select
                    defaultValue={config.answerOnce ? 'yes' : 'no'}
                    onChange={(v: 'yes' | 'no') =>
                        updateConfig({
                            answerOnce: v === 'yes',
                        })
                    }
                >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                </Select>
            </div>
            <div className="flex flex-col gap-2 ">
                <div className="flex flex-col gap-2 ">
                    <h2 className="text-lg font-medium">Text for Correct answers</h2>
                    <Input
                        className="text-lg"
                        placeholder="Optional"
                        defaultValue={config.results.yesLabel}
                        onChange={(e) => {
                            const value = e.target.value

                            updateConfig({
                                results: {
                                    ...config.results,
                                    yesLabel: value || undefined,
                                },
                            })
                        }}
                    />
                </div>
                <div className="flex flex-col gap-2 ">
                    <h2 className="text-lg font-medium">Text for Wrong answers</h2>
                    <Input
                        className="text-lg"
                        placeholder="Optional"
                        defaultValue={config.results.noLabel}
                        onChange={(e) => {
                            const value = e.target.value

                            updateConfig({
                                results: {
                                    ...config.results,
                                    noLabel: value || undefined,
                                },
                            })
                        }}
                    />
                </div>

                <div className="flex flex-col gap-2 ">
                    <h2 className="text-lg font-semibold">Slide Background</h2>
                    <ColorPicker
                        className="w-full"
                        enabledPickers={['solid', 'gradient']}
                        background={
                            config.results?.background ??
                            defaultConfig.initialConfig.results.background
                        }
                        setBackground={(value) =>
                            updateConfig({
                                results: {
                                    ...config.results,
                                    background: value,
                                },
                            })
                        }
                        uploadBackground={async (base64String, contentType) => {
                            const { filePath } = await uploadImage({
                                base64String: base64String,
                                contentType: contentType,
                            })

                            return filePath
                        }}
                    />
                </div>
                <div className="flex flex-col gap-2 ">
                    <h2 className="text-lg font-semibold">Label Background</h2>
                    <ColorPicker
                        className="w-full"
                        enabledPickers={['solid', 'gradient']}
                        background={
                            config.results?.labelBackground ??
                            defaultConfig.initialConfig.results.labelBackground
                        }
                        setBackground={(value) =>
                            updateConfig({
                                results: {
                                    ...config.results,
                                    labelBackground: value,
                                },
                            })
                        }
                        uploadBackground={async (base64String, contentType) => {
                            const { filePath } = await uploadImage({
                                base64String: base64String,
                                contentType: contentType,
                            })

                            return filePath
                        }}
                    />
                </div>
                <div className="flex flex-col gap-2 ">
                    <h2 className="text-lg font-semibold">Bar color for correct answers</h2>
                    <ColorPicker
                        className="w-full"
                        enabledPickers={['solid', 'gradient']}
                        background={
                            config.results?.yesBarColor ??
                            defaultConfig.initialConfig.results.yesBarColor
                        }
                        setBackground={(value) =>
                            updateConfig({
                                results: {
                                    ...config.results,
                                    yesBarColor: value,
                                },
                            })
                        }
                        uploadBackground={async (base64String, contentType) => {
                            const { filePath } = await uploadImage({
                                base64String: base64String,
                                contentType: contentType,
                            })

                            return filePath
                        }}
                    />
                </div>
                <div className="flex flex-col gap-2 ">
                    <h2 className="text-lg font-semibold">Bar color for wrong answers</h2>
                    <ColorPicker
                        className="w-full"
                        enabledPickers={['solid', 'gradient']}
                        background={
                            config.results?.noBarColor ??
                            defaultConfig.initialConfig.results.noBarColor
                        }
                        setBackground={(value) =>
                            updateConfig({
                                results: {
                                    ...config.results,
                                    noBarColor: value,
                                },
                            })
                        }
                        uploadBackground={async (base64String, contentType) => {
                            const { filePath } = await uploadImage({
                                base64String: base64String,
                                contentType: contentType,
                            })

                            return filePath
                        }}
                    />
                </div>
            </div>
        </div>
    )
}
