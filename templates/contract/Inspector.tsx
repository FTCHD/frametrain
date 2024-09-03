'use client'
import { Button, Input, Label, RadioGroup, Separator } from '@/sdk/components'
import TextSlideEditor, { TextSlideStyleConfig } from '@/sdk/components/TextSlideEditor'
import { useFrameConfig, useUploadImage } from '@/sdk/hooks'
import { type ReactNode, useState } from 'react'
import toast from 'react-hot-toast'
import { useDebouncedCallback } from 'use-debounce'
import type { Config } from '.'
import { getContractData } from './common/etherscan'

type MenuItem = {
    title: string
    description: string
    key: 'cover' | 'contract'
}

type NavBarItem = MenuItem & {
    active: boolean
}

function sidebarNavItems(obj: { tab: NavBarItem['key'] }): NavBarItem[]
function sidebarNavItems(obj: {
    tab: NavBarItem['key']
    showOne: true
}): MenuItem
function sidebarNavItems(obj: {
    tab: NavBarItem['key']
    showOne?: true
}): MenuItem | NavBarItem[] {
    const items: MenuItem[] = [
        {
            title: 'Cover Slide',
            key: 'cover',
            description: 'Configure what shows up on the cover screen of your Frame.',
        },
        {
            title: 'Contract Slide',
            key: 'contract',
            description: 'Configure the contract slide of your Frame.',
        },
    ]

    if (obj.showOne) {
        const item = items.filter((item) => item.key === obj.tab)[0]
        return item
    }

    const menu: NavBarItem[] = items.map((item) => ({
        ...item,
        active: item.key === obj.tab,
    }))

    return menu
}

export default function Inspector() {
    const [config, updateConfig] = useFrameConfig<Config>()
    const [activeTab, setActiveTab] = useState<NavBarItem['key']>('cover')

    const [coverType, setCoverType] = useState<'text' | 'image'>(
        config.cover.image ? 'image' : 'text'
    )
    const uploadImage = useUploadImage()
    const tab = sidebarNavItems({ tab: activeTab, showOne: true })
    const tabs = sidebarNavItems({ tab: activeTab })

    const onChangeLink = useDebouncedCallback(async (link: string) => {
        if (config.etherscan?.link === link) return

        if (!link.length) {
            updateConfig({ etherscan: null })
            return
        }

        try {
            //
            const etherscan = await getContractData(link)
            toast.success('Contract data fetched successfully')
            updateConfig({ etherscan })
        } catch {
            toast.error('Error fetching contract data')
        }
    }, 100)

    const renderTabSection = () => {
        let section: ReactNode

        switch (tab.key) {
            case 'cover': {
                section = (
                    <>
                        <div className="flex flex-col gap-2 ">
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
                        <div className="flex flex-col gap-2 w-full">
                            <h2 className="text-lg font-semibold">Cover Type</h2>
                            <RadioGroup.Root
                                defaultValue={coverType}
                                className="flex flex-row"
                                onValueChange={(val) => {
                                    const value = val as 'image' | 'text'
                                    setCoverType(value)
                                    if (val === 'text' && config.cover.image) {
                                        updateConfig({
                                            cover: {
                                                ...config.cover,
                                                image: null,
                                            },
                                        })
                                    }
                                }}
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroup.Item value="text" id="text" />
                                    <Label htmlFor="text">Text</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroup.Item value="image" id="image" />
                                    <Label htmlFor="image">Image</Label>
                                </div>
                            </RadioGroup.Root>
                        </div>
                        <div className="flex flex-col gap-4 w-full">
                            {coverType === 'image' ? (
                                <div className="flex flex-col gap-2 w-full">
                                    <label
                                        htmlFor="cover-image"
                                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                    >
                                        {config.cover.image ? 'Update' : 'Upload'} Cover Image
                                    </label>
                                    <Input
                                        accept="image/png, image/jpeg, image/gif, image/webp"
                                        type="file"
                                        id="cover-image"
                                        className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                                        onChange={async (e) => {
                                            if (e.target.files?.[0]) {
                                                const reader = new FileReader()
                                                reader.readAsDataURL(e.target.files[0])

                                                const base64String = (await new Promise(
                                                    (resolve) => {
                                                        reader.onload = () => {
                                                            const base64String = (
                                                                reader.result as string
                                                            ).split(',')[1]
                                                            resolve(base64String)
                                                        }
                                                    }
                                                )) as string

                                                const contentType = e.target.files[0].type as
                                                    | 'image/png'
                                                    | 'image/jpeg'
                                                    | 'image/gif'
                                                    | 'image/webp'

                                                const { filePath } = await uploadImage({
                                                    base64String,
                                                    contentType,
                                                })

                                                if (filePath) {
                                                    const image = `${process.env.NEXT_PUBLIC_CDN_HOST}/${filePath}`
                                                    updateConfig({
                                                        cover: {
                                                            ...config.cover,
                                                            image,
                                                        },
                                                    })
                                                }
                                            }
                                        }}
                                    />
                                    {config.cover.image ? (
                                        <Button
                                            variant="destructive"
                                            onClick={() => {
                                                updateConfig({
                                                    cover: {
                                                        ...config.cover,
                                                        image: null,
                                                    },
                                                })
                                            }}
                                            className="w-full"
                                        >
                                            Remove
                                        </Button>
                                    ) : null}
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4 w-full">
                                    <TextSlideEditor
                                        name="Cover"
                                        title={config.cover.title}
                                        subtitle={config.cover.subtitle}
                                        bottomMessage={config.cover.bottomMessage}
                                        background={config.cover.background}
                                        onUpdate={(cover) => {
                                            updateConfig({
                                                cover,
                                            })
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </>
                )
                break
            }
            case 'contract': {
                section = (
                    <div className="flex flex-col gap-2 w-full">
                        <h2 className="text-2xl text-center">Field styles customizations</h2>
                        <TextSlideStyleConfig
                            name="Contract Function name"
                            config={config.functionSlide?.title}
                            updateConfig={(title) => {
                                updateConfig({
                                    functionSlide: {
                                        ...config.functionSlide,
                                        title,
                                    },
                                })
                            }}
                            background={config.functionSlide?.background}
                            setBackground={(background) => {
                                updateConfig({
                                    functionSlide: {
                                        ...config.functionSlide,
                                        background,
                                    },
                                })
                            }}
                        />
                        <TextSlideStyleConfig
                            name="Contract Function data/signature"
                            config={config.functionSlide?.subtitle}
                            updateConfig={(subtitle) => {
                                updateConfig({
                                    functionSlide: {
                                        ...config.functionSlide,
                                        subtitle,
                                    },
                                })
                            }}
                        />
                        <TextSlideStyleConfig
                            name="Progress"
                            config={config.functionSlide?.bottomMessage}
                            updateConfig={(bottomMessage) => {
                                updateConfig({
                                    functionSlide: {
                                        ...config.functionSlide,
                                        bottomMessage,
                                    },
                                })
                            }}
                        />
                    </div>
                )
                break
            }
        }

        return section
    }

    return (
        <div className="flex flex-col gap-5 w-full h-full">
            <div className="flex flex-row gap-2 w-full">
                {tabs.map((item) => (
                    <Button
                        variant="ghost"
                        key={item.key}
                        className={`justify-start w-full ${
                            item.active
                                ? 'bg-muted hover:bg-muted'
                                : 'hover:bg-transparent hover:underline'
                        }`}
                        onClick={() => setActiveTab(item.key)}
                    >
                        {item.title}
                    </Button>
                ))}
            </div>
            <div className="flex flex-col gap-2 w-full">
                <h2 className="text-2xl font-medium">{tab.title}</h2>
                <p className="text-sm text-muted-foreground">{tab.description}</p>
                <Separator />
            </div>
            <div className="flex flex-col gap-4 w-full">{renderTabSection()}</div>
        </div>
    )
}
