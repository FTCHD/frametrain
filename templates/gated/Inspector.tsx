'use client'

import { useFrameConfig, useUploadImage } from '@/sdk/hooks'
import type { Config } from '.'
import { type ReactNode, useRef, useState } from 'react'
import { Input } from '@/components/shadcn/Input'
import { Button } from '@/components/shadcn/Button'
import { Trash } from 'lucide-react'
import toast from 'react-hot-toast'
import { useDebouncedCallback } from 'use-debounce'
import GatingOptions from '@/sdk/components/GatingOptions'
import { corsFetch } from '@/sdk/scrape'
import { Separator } from '@/components/shadcn/Separator'
import TextSlideEditor from '@/sdk/components/TextSlideEditor'
import { RadioGroup, RadioGroupItem } from '@/components/shadcn/RadioGroup'
import { Label } from '@/components/shadcn/Label'

type MenuItem = {
    title: string
    description: string
    key: 'cover' | 'rewards' | 'gating' | 'general'
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
            title: 'General',
            key: 'general',
            description: 'Configure your general settings.',
        },
        {
            title: 'Cover',
            key: 'cover',
            description: 'Configure your cover slide.',
        },
        {
            title: 'Gating',
            key: 'gating',
            description: 'Configure your gating settings.',
        },
        {
            title: 'Rewards',
            key: 'rewards',
            description: 'Configure your rewards settings.',
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

const warpcastBaseApiUrl = 'https://api.warpcast.com/v2'

export default function Inspector() {
    const uploadImage = useUploadImage()
    const [config, updateConfig] = useFrameConfig<Config>()
    const [activeTab, setActiveTab] = useState<NavBarItem['key']>('general')
    const disableLinksField = config.links?.length >= 4

    const [coverType, setCoverType] = useState<'text' | 'image'>(
        config.cover.image ? 'image' : 'text'
    )
    const [successType, setSuccessType] = useState<'text' | 'image'>(
        config.success?.image ? 'image' : 'text'
    )
    const linkInputRef = useRef<HTMLInputElement>(null)
    const tab = sidebarNavItems({ tab: activeTab, showOne: true })
    const tabs = sidebarNavItems({ tab: activeTab })

    const onChangeLabel = useDebouncedCallback(async (label: string) => {
        if (label === config.label) {
            return
        }
        updateConfig({
            label: label === '' ? null : label,
        })
    }, 1000)

    const onChangeUsername = useDebouncedCallback(async (username: string) => {
        if (username === '' || username === config.owner?.username) {
            return
        }

        try {
            const response = await corsFetch(
                `${warpcastBaseApiUrl}/user-by-username?username=${username}`
            )

            if (!response) return

            const data = JSON.parse(response) as
                | {
                      result: { user: { fid: number; username: string } }
                  }
                | { errors: unknown[] }

            if ('errors' in data) {
                toast.error(`No FID associated with username ${username}`)
                return
            }
            updateConfig({
                owner: {
                    fid: data.result.user.fid,
                    username: data.result.user.username,
                },
            })
        } catch {
            toast.error('Failed to fetch FID')
        }
    }, 1000)

    const renderTabSection = () => {
        let component: ReactNode = null

        switch (tab.key) {
            case 'cover': {
                component = (
                    <>
                        <div className="flex flex-col gap-2 w-full">
                            <h2 className="text-lg font-semibold">Cover Type</h2>
                            <RadioGroup
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
                                    <RadioGroupItem value="text" id="text" />
                                    <Label htmlFor="text">Text</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="image" id="image" />
                                    <Label htmlFor="image">Image</Label>
                                </div>
                            </RadioGroup>
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
                                                    const coverImage = `${process.env.NEXT_PUBLIC_CDN_HOST}/${filePath}`
                                                    updateConfig({
                                                        cover: {
                                                            ...config.cover,
                                                            image: coverImage,
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

            case 'gating': {
                component = (
                    <div className="flex flex-col gap-4 w-full">
                        <h2 className="text-lg font-semibold">Requirements</h2>
                        <GatingOptions
                            onUpdate={(option) => {
                                updateConfig({
                                    requirements: {
                                        ...config.requirements,
                                        ...option,
                                    },
                                })
                            }}
                            config={config.requirements}
                        />
                    </div>
                )
                break
            }

            case 'rewards': {
                component = (
                    <>
                        <div className="flex flex-col gap-2 w-full">
                            <h2 className="text-lg font-semibold">Rewards Slide Type</h2>
                            <RadioGroup
                                defaultValue={successType}
                                className="flex flex-row"
                                onValueChange={(val) => {
                                    const value = val as 'image' | 'text'
                                    setSuccessType(value)
                                    if (val === 'text' && config.success.image) {
                                        updateConfig({
                                            success: {
                                                ...config.success,
                                                image: null,
                                            },
                                        })
                                    }
                                }}
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="text" id="text" />
                                    <Label htmlFor="text">Text</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="image" id="image" />
                                    <Label htmlFor="image">Image</Label>
                                </div>
                            </RadioGroup>
                        </div>
                        <div className="flex flex-col gap-4 w-full">
                            {successType === 'image' ? (
                                <div className="flex flex-col gap-2 w-full">
                                    <label
                                        htmlFor="cover-image"
                                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                    >
                                        {config.success.image ? 'Update' : 'Upload'} Rewards Image
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
                                                        success: {
                                                            ...config.success,
                                                            image,
                                                        },
                                                    })
                                                }
                                            }
                                        }}
                                    />
                                    {config.success.image ? (
                                        <Button
                                            variant="destructive"
                                            onClick={() => {
                                                updateConfig({
                                                    success: {
                                                        ...config.success,
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
                                        name="Rewards"
                                        title={config.success.title}
                                        subtitle={config.success.subtitle}
                                        bottomMessage={config.success.bottomMessage}
                                        background={config.success.background}
                                        onUpdate={(success) => {
                                            updateConfig({
                                                success,
                                            })
                                        }}
                                    >
                                        <div className="flex flex-col gap-2 w-full">
                                            <h2 className="text-lg">Add a Link</h2>
                                            <div className="flex flex-row gap-2 w-full items-center">
                                                <Input
                                                    disabled={disableLinksField}
                                                    ref={linkInputRef}
                                                    className="text-lg border rounded py-2 px-4 w-full"
                                                    type="url"
                                                />
                                                {!disableLinksField ? (
                                                    <Button
                                                        type="button"
                                                        disabled={disableLinksField}
                                                        className="px-4 py-2 rounded-md"
                                                        onClick={() => {
                                                            if (
                                                                !linkInputRef.current ||
                                                                config.links?.length >= 4
                                                            )
                                                                return

                                                            const link =
                                                                linkInputRef.current.value.trim()

                                                            if (link.length < 10) return

                                                            updateConfig({
                                                                links: [
                                                                    ...(config.links || []),
                                                                    link,
                                                                ],
                                                            })

                                                            linkInputRef.current.value = ''
                                                        }}
                                                    >
                                                        Add Link
                                                    </Button>
                                                ) : null}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <h2 className="text-2xl font-semibold">Manage Links</h2>
                                            {!config.links?.length ? (
                                                <p className="italic text-gray-300">
                                                    Links added yet!
                                                </p>
                                            ) : (
                                                <div className="w-full flex flex-col gap-2">
                                                    {config.links?.map((link, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex flex-row items-center justify-between bg-slate-50 bg-opacity-10 p-2 rounded"
                                                        >
                                                            <span>
                                                                {index + 1}. {link}
                                                            </span>
                                                            <Button
                                                                variant={'destructive'}
                                                                onClick={() =>
                                                                    updateConfig({
                                                                        links: [
                                                                            ...config.links.slice(
                                                                                0,
                                                                                index
                                                                            ),
                                                                            ...config.links.slice(
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
                                            )}
                                        </div>
                                    </TextSlideEditor>
                                </div>
                            )}
                        </div>
                    </>
                )

                break
            }

            default: {
                component = (
                    <>
                        <div className="flex flex-col gap-2 w-full">
                            <h2 className="text-lg font-semibold">Your Farcaster username</h2>
                            <Input
                                className="w-full"
                                placeholder="eg. vitalik.eth"
                                defaultValue={config.owner?.username}
                                onChange={async (e) => onChangeUsername(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <h2 className="text-lg font-semibold">Button Label</h2>
                            <Input
                                className="w-full"
                                placeholder="View"
                                defaultValue={config.label || ''}
                                onChange={async (e) => {
                                    onChangeLabel(e.target.value)
                                }}
                            />
                        </div>
                    </>
                )
                break
            }
        }

        return <>{component}</>
    }

    return (
        <div className="flex flex-col gap-5 w-full h-full">
            <div className="grid grid-cols-3 gap-2 w-full">
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
