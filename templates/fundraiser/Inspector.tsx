'use client'
import { Button } from '@/components/shadcn/Button'
import { Input } from '@/components/shadcn/Input'
import { useFarcasterId, useFrameConfig, useUploadImage } from '@/sdk/hooks'
import { type ReactNode, useEffect, useRef, useState } from 'react'
import type { Config } from '.'
import { Separator } from '@/components/shadcn/Separator'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/shadcn/Select'
import { type ChainKey, getTokenSymbol, supportedChains } from './utils/viem'
import { Switch } from '@/components/shadcn/Switch'
import { Label } from '@/components/shadcn/InputLabel'
import { Trash } from 'lucide-react'
import { formatSymbol } from './utils/shared'
import toast from 'react-hot-toast'
import { ColorPicker, FontFamilyPicker, FontStylePicker, FontWeightPicker } from '@/sdk/components'
import { Slider } from '@/components/shadcn/Slider'
import { RadioGroup, RadioGroupItem } from '@/components/shadcn/RadioGroup'
import { getFarcasterProfiles } from '@/sdk/neynar'

type MenuItem = {
    title: string
    description: string
    key: 'cover' | 'fundraise' | 'success' | 'about' | 'progress'
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
            title: 'Progress Bar',
            key: 'progress',
            description: 'Configure the progress bar color.',
        },
        {
            title: 'Fundraise',
            key: 'fundraise',
            description: 'Configure your fundraiser settings.',
        },
        {
            title: 'About Slide',
            key: 'about',
            description: 'Configure what shows up on the about slide of your Frame.',
        },
        {
            title: 'Cover Slide',
            key: 'cover',
            description: 'Configure what shows up on the cover screen of your Frame.',
        },
        {
            title: 'Success Slide',
            key: 'success',
            description: 'Configure what shows up after a Donation was successful.',
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
    const [activeTab, setActiveTab] = useState<NavBarItem['key']>('progress')
    const fid = useFarcasterId()

    const amounts = config.amounts || []

    const disableAmountsField = amounts.length >= 3
    const tab = sidebarNavItems({ tab: activeTab, showOne: true })
    const tabs = sidebarNavItems({ tab: activeTab })

    const amountInputRef = useRef<HTMLInputElement>(null)
    const uploadImage = useUploadImage()
    const [coverTitleFontSize, setCoverTitleFontSize] = useState(
        config.cover?.titleStyles?.size || 50
    )
    const [coverDescriptionFontSize, setCoverDescriptionFontSize] = useState(
        config.cover?.subtitleStyles?.size || 30
    )

    const [coverMessageFontSize, setCoverMessageFontSize] = useState(
        config.cover.customStyles?.size || 20
    )
    const [successTitleFontSize, setSuccessTitleFontSize] = useState(
        config.success.titleStyles?.size || 50
    )
    const [successDescriptionFontSize, setSuccessDescriptionFontSize] = useState(
        config.success?.subtitleStyles?.size || 30
    )

    const [successMesaageFontSize, setSuccessMessageFontSize] = useState(
        config.success.customStyles?.size || 20
    )
    const [aboutTitleFontSize, setAboutTitleFontSize] = useState(
        config.about.titleStyles?.size || 50
    )
    const [aboutDescriptionFontSize, setAboutDescriptionFontSize] = useState(
        config.about.subtitleStyles?.size || 30
    )

    const [aboutMesaageFontSize, setAboutMessageFontSize] = useState(
        config.about.customStyles?.size || 20
    )
    const [coverType, setCoverType] = useState<'text' | 'image'>(
        config.cover.image ? 'image' : 'text'
    )
    const [aboutType, setAboutType] = useState<'text' | 'image'>(
        config.about.image ? 'image' : 'text'
    )
    const [successType, setSuccessType] = useState<'text' | 'image'>(
        config.success?.image ? 'image' : 'text'
    )

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        async function setUserAddress() {
            if (config.address) {
                return
            }
            try {
                const users = await getFarcasterProfiles([fid])
                const user = users[0]
                const ethAddresses = user.verified_addresses.eth_addresses

                if (ethAddresses.length === 0) {
                    return
                }

                updateConfig({
                    address: ethAddresses[0],
                })
                toast.success('We set the address to your verified Warpcast address')
            } catch {}
        }

        setUserAddress()
    }, [])

    const TextSlide = ({
        cover,
        slide,
        image,
        fontSize,
        setFontSize,
        subtitleFontSize,
        setSubtitleFontSize,
        cmFontSize,
        setCmFontSize,
        onChangeValue,
    }: {
        cover: 'image' | 'text'
        setCover?: (type: 'image' | 'text') => void
        slide: string
        image?: string
        fontSize: number
        setFontSize: (size: number) => void
        subtitleFontSize: number
        setSubtitleFontSize: (size: number) => void
        cmFontSize: number
        setCmFontSize: (size: number) => void
        onChangeValue?: (value: {
            key: string
            data: unknown // { [key: string]: unknown }
        }) => void
    }) => {
        const key = tab.key
        console.log(`inside TextSlide of ${slide}`, {
            key,
            config: config[key],
            fontSize,
            subtitleFontSize,
            cmFontSize,
        })
        return (
            <>
                <div className="flex flex-col gap-2 w-full">
                    <h2 className="text-lg font-semibold">{slide} Type</h2>
                    <RadioGroup
                        defaultValue={cover}
                        className="flex flex-row"
                        onValueChange={(val) => {
                            onChangeValue?.({
                                key: 'coverType',
                                data: val,
                            })
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
                <div className="flex">
                    {cover === 'image' ? (
                        <div className="flex flex-col gap-2 w-full">
                            <label
                                htmlFor="cover-image"
                                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                                {image ? 'Update' : 'Upload'} Cover Image
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

                                        const base64String = (await new Promise((resolve) => {
                                            reader.onload = () => {
                                                const base64String = (
                                                    reader.result as string
                                                ).split(',')[1]
                                                resolve(base64String)
                                            }
                                        })) as string

                                        const contentType = e.target.files[0].type as
                                            | 'image/png'
                                            | 'image/jpeg'
                                            | 'image/gif'
                                            | 'image/webp'

                                        const filePath = await uploadImage({
                                            base64String,
                                            contentType,
                                        })

                                        if (filePath) {
                                            const coverImage = `${process.env.NEXT_PUBLIC_CDN_HOST}/${filePath}`
                                            onChangeValue?.({
                                                key: 'coverImage',
                                                data: { image: coverImage },
                                            })
                                        }
                                    }
                                }}
                            />
                            {image ? (
                                <Button
                                    variant="destructive"
                                    onClick={() => {
                                        updateConfig({
                                            [key]: {
                                                ...config[key],
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
                            <div className="flex flex-col gap-2 w-full">
                                <div className="flex flex-col w-full">
                                    <h2 className="text-lg">Title</h2>
                                    <Input
                                        className="py-2 text-lg"
                                        defaultValue={config[key].title}
                                        onChange={async (e) => {
                                            const title = e.target.value.trim()
                                            if (title === '') {
                                                toast.error('A title is required')
                                                return
                                            }
                                            updateConfig({
                                                [key]: {
                                                    ...config[key],
                                                    title,
                                                },
                                            })
                                        }}
                                        placeholder="title"
                                    />
                                </div>
                                <div className="flex flex-col w-full">
                                    <h2 className="text-lg">Subtitle</h2>
                                    <Input
                                        className="py-2 text-lg"
                                        defaultValue={config[key].subtitle}
                                        onChange={async (e) => {
                                            const subtitle = e.target.value.trim()
                                            if (subtitle === '') {
                                                toast.error('A subtitle is required')
                                                return
                                            }

                                            updateConfig({
                                                [key]: {
                                                    ...config[key],
                                                    subtitle,
                                                },
                                            })
                                        }}
                                        placeholder="subtitle"
                                    />
                                </div>
                                <div className="flex flex-col w-full">
                                    <h2 className="text-lg">Custom Message</h2>
                                    <Input
                                        className="py-2 text-lg"
                                        defaultValue={config[key].customMessage}
                                        onChange={async (e) => {
                                            const value = e.target.value.trim()
                                            updateConfig({
                                                [key]: {
                                                    ...config[key],
                                                    customMessage: value === '' ? null : value,
                                                },
                                            })
                                        }}
                                        placeholder="your custom message"
                                    />
                                </div>
                            </div>

                            {/* Styles config */}
                            <div className="flex flex-col gap-2 w-full">
                                <h2 className="text-lg text-center">Customizations</h2>
                                <div className="flex flex-col gap-2 w-full">
                                    <h2 className="text-lg font-semibold">Background</h2>
                                    <ColorPicker
                                        className="w-full"
                                        enabledPickers={['solid', 'gradient', 'image']}
                                        background={config[key].backgroundColor || 'black'}
                                        setBackground={(backgroundColor) => {
                                            updateConfig({
                                                [key]: {
                                                    ...config[key],
                                                    backgroundColor,
                                                },
                                            })
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
                                {/* title */}
                                <div className="flex flex-col gap-2 w-full">
                                    <h2 className="text-lg font-semibold">Title Color</h2>
                                    <ColorPicker
                                        className="w-full"
                                        background={config[key]?.titleStyles?.color || 'white'}
                                        setBackground={(color) => {
                                            updateConfig({
                                                [key]: {
                                                    ...config[key],
                                                    titleStyles: {
                                                        ...config[key]?.titleStyles,
                                                        color,
                                                    },
                                                },
                                            })
                                        }}
                                    />
                                </div>
                                <div className="flex flex-col gap-2 w-full">
                                    <label className="text-lg font-semibold">
                                        Title Size ({fontSize}px)
                                    </label>

                                    <Slider
                                        defaultValue={[fontSize]}
                                        max={140}
                                        step={2}
                                        onValueChange={(newRange) => {
                                            const size = newRange[0]
                                            setFontSize(size)
                                            updateConfig({
                                                [key]: {
                                                    ...config[key],
                                                    titleStyles: {
                                                        ...config[key]?.titleStyles,
                                                        size,
                                                    },
                                                },
                                            })
                                        }}
                                    />
                                </div>
                                <div className="flex flex-col gap-2 w-full">
                                    <h2 className="text-lg font-semibold">Title Font</h2>
                                    <FontFamilyPicker
                                        defaultValue={config[key]?.titleStyles?.font || 'Roboto'}
                                        onSelect={(font) => {
                                            updateConfig({
                                                [key]: {
                                                    ...config[key],
                                                    titleStyles: {
                                                        ...config[key]?.titleStyles,
                                                        font,
                                                    },
                                                },
                                            })
                                        }}
                                    />
                                </div>
                                <div className="flex flex-col gap-2 w-full">
                                    <h2 className="text-lg font-semibold">Title Style</h2>
                                    <FontStylePicker
                                        currentFont={config[key]?.titleStyles?.font || 'Roboto'}
                                        defaultValue={config[key]?.titleStyles?.style || 'normal'}
                                        onSelect={(style: string) => {
                                            updateConfig({
                                                [key]: {
                                                    ...config[key],
                                                    titleStyles: {
                                                        ...config[key]?.titleStyles,
                                                        style,
                                                    },
                                                },
                                            })
                                        }}
                                    />
                                </div>
                                <div className="flex flex-col gap-2 w-full">
                                    <h2 className="text-lg font-semibold">Title Weight</h2>
                                    <FontWeightPicker
                                        currentFont={config[key]?.titleStyles?.font || 'Roboto'}
                                        defaultValue={config[key]?.titleStyles?.weight || 'normal'}
                                        onSelect={(weight) => {
                                            updateConfig({
                                                [key]: {
                                                    ...config[key],
                                                    titleStyles: {
                                                        ...config[key]?.titleStyles,
                                                        weight,
                                                    },
                                                },
                                            })
                                        }}
                                    />
                                </div>
                                <div className="flex flex-col gap-2 w-full">
                                    <h2 className="text-lg font-semibold">Title Position</h2>
                                    <Select
                                        defaultValue={
                                            config[key]?.titleStyles?.alignment || 'center'
                                        }
                                        onValueChange={(alignment: 'left' | 'center' | 'right') => {
                                            updateConfig({
                                                [key]: {
                                                    ...config[key],
                                                    titleStyles: {
                                                        ...config[key]?.titleStyles,
                                                        alignment,
                                                    },
                                                },
                                            })
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Left" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={'left'}>Left</SelectItem>
                                            <SelectItem value={'center'}>Center</SelectItem>
                                            <SelectItem value={'right'}>Right</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {/* subtitle */}
                                <div className="flex flex-col gap-2 w-full">
                                    <h2 className="text-lg font-semibold">Subtitle Color</h2>
                                    <ColorPicker
                                        className="w-full"
                                        background={config[key]?.subtitleStyles?.color || 'white'}
                                        setBackground={(color) => {
                                            updateConfig({
                                                [key]: {
                                                    ...config[key],
                                                    subtitleStyles: {
                                                        ...config[key]?.subtitleStyles,
                                                        color,
                                                    },
                                                },
                                            })
                                        }}
                                    />
                                </div>
                                <div className="flex flex-col gap-2 w-full">
                                    <label className="text-lg font-semibold">
                                        Subtitle Size ({subtitleFontSize}px)
                                    </label>
                                    <Slider
                                        defaultValue={[subtitleFontSize]}
                                        max={140}
                                        step={2}
                                        onValueChange={(newRange) => {
                                            const size = newRange[0]
                                            setSubtitleFontSize(size)
                                            updateConfig({
                                                [key]: {
                                                    ...config[key],
                                                    subtitleStyles: {
                                                        ...config[key]?.subtitleStyles,
                                                        size,
                                                    },
                                                },
                                            })
                                        }}
                                    />
                                </div>
                                <div className="flex flex-col gap-2 w-full">
                                    <h2 className="text-lg font-semibold">Subtitle Font</h2>
                                    <FontFamilyPicker
                                        defaultValue={config[key]?.titleStyles?.font || 'Roboto'}
                                        onSelect={(font) => {
                                            updateConfig({
                                                [key]: {
                                                    ...config[key],
                                                    subtitleStyles: {
                                                        ...config[key]?.subtitleStyles,
                                                        font,
                                                    },
                                                },
                                            })
                                        }}
                                    />
                                </div>
                                <div className="flex flex-col gap-2 w-full">
                                    <h2 className="text-lg font-semibold">Subtitle Style</h2>
                                    <FontStylePicker
                                        currentFont={config[key]?.titleStyles?.font || 'Roboto'}
                                        defaultValue={config[key]?.titleStyles?.style || 'normal'}
                                        onSelect={(style) => {
                                            updateConfig({
                                                [key]: {
                                                    ...config[key],
                                                    subtitleStyles: {
                                                        ...config[key]?.subtitleStyles,
                                                        style,
                                                    },
                                                },
                                            })
                                        }}
                                    />
                                </div>
                                <div className="flex flex-col gap-2 w-full">
                                    <h2 className="text-lg font-semibold">Subtitle Weight</h2>
                                    <FontWeightPicker
                                        currentFont={config[key]?.titleStyles?.font || 'Roboto'}
                                        defaultValue={config[key]?.titleStyles?.weight || 'normal'}
                                        onSelect={(weight) => {
                                            updateConfig({
                                                [key]: {
                                                    ...config[key],
                                                    subtitleStyles: {
                                                        ...config[key]?.subtitleStyles,
                                                        weight,
                                                    },
                                                },
                                            })
                                        }}
                                    />
                                </div>
                                <div className="flex flex-col gap-2 w-full">
                                    <h2 className="text-lg font-semibold">Subtitle Position</h2>
                                    <Select
                                        defaultValue={
                                            config[key]?.titleStyles?.alignment || 'center'
                                        }
                                        onValueChange={(alignment: 'left' | 'center' | 'right') => {
                                            updateConfig({
                                                [key]: {
                                                    ...config[key],
                                                    subtitleStyles: {
                                                        ...config[key]?.subtitleStyles,
                                                        alignment,
                                                    },
                                                },
                                            })
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Left" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={'left'}>Left</SelectItem>
                                            <SelectItem value={'center'}>Center</SelectItem>
                                            <SelectItem value={'right'}>Right</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {/* custom message */}
                                <div className="flex flex-col gap-2 w-full">
                                    <h2 className="text-lg font-semibold">Custom Message Color</h2>
                                    <ColorPicker
                                        className="w-full"
                                        background={config[key]?.customStyles?.color || 'white'}
                                        setBackground={(color) => {
                                            updateConfig({
                                                [key]: {
                                                    ...config[key],
                                                    customStyles: {
                                                        ...config[key]?.customStyles,
                                                        color,
                                                    },
                                                },
                                            })
                                        }}
                                    />
                                </div>
                                <div className="flex flex-col gap-2 w-full">
                                    <label className="text-lg font-semibold">
                                        Custom Message Size ({cmFontSize}px)
                                    </label>
                                    <Slider
                                        defaultValue={[cmFontSize]}
                                        max={140}
                                        step={2}
                                        onValueChange={(newRange) => {
                                            const size = newRange[0]
                                            setCmFontSize(size)
                                            updateConfig({
                                                [key]: {
                                                    ...config[key],
                                                    customStyles: {
                                                        ...config[key]?.customStyles,
                                                        size,
                                                    },
                                                },
                                            })
                                        }}
                                    />
                                </div>
                                <div className="flex flex-col gap-2 w-full">
                                    <h2 className="text-lg font-semibold">Custom Message Font</h2>
                                    <FontFamilyPicker
                                        defaultValue={config[key]?.customStyles?.font || 'Roboto'}
                                        onSelect={(font) => {
                                            updateConfig({
                                                [key]: {
                                                    ...config[key],
                                                    customStyles: {
                                                        ...config[key]?.customStyles,
                                                        font,
                                                    },
                                                },
                                            })
                                        }}
                                    />
                                </div>
                                <div className="flex flex-col gap-2 w-full">
                                    <h2 className="text-lg font-semibold">Custom Message Style</h2>
                                    <FontStylePicker
                                        currentFont={config[key]?.customStyles?.font || 'Roboto'}
                                        defaultValue={config[key]?.customStyles?.style || 'normal'}
                                        onSelect={(style) => {
                                            updateConfig({
                                                [key]: {
                                                    ...config[key],
                                                    customStyles: {
                                                        ...config[key]?.customStyles,
                                                        style,
                                                    },
                                                },
                                            })
                                        }}
                                    />
                                </div>
                                <div className="flex flex-col gap-2 w-full">
                                    <h2 className="text-lg font-semibold">Custom Message Weight</h2>
                                    <FontWeightPicker
                                        currentFont={config[key]?.customStyles?.font || 'Roboto'}
                                        defaultValue={config[key]?.customStyles?.weight || 'normal'}
                                        onSelect={(weight) => {
                                            updateConfig({
                                                [key]: {
                                                    ...config[key],
                                                    customStyles: {
                                                        ...config[key]?.customStyles,
                                                        weight,
                                                    },
                                                },
                                            })
                                        }}
                                    />
                                </div>
                                <div className="flex flex-col gap-2 w-full">
                                    <h2 className="text-lg font-semibold">
                                        Custom Message Position
                                    </h2>
                                    <Select
                                        defaultValue={
                                            config[key]?.customStyles?.alignment || 'center'
                                        }
                                        onValueChange={(alignment: 'left' | 'center' | 'right') => {
                                            updateConfig({
                                                [key]: {
                                                    ...config[key],
                                                    customStyles: {
                                                        ...config[key]?.customStyles,
                                                        alignment,
                                                    },
                                                },
                                            })
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Left" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={'left'}>Left</SelectItem>
                                            <SelectItem value={'center'}>Center</SelectItem>
                                            <SelectItem value={'right'}>Right</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </>
        )
    }

    const renderTabSection = (): ReactNode => {
        switch (tab.key) {
            case 'fundraise': {
                const showTokenFields =
                    config.address &&
                    config.token?.address &&
                    config.token?.chain &&
                    config.token?.symbol

                return (
                    <>
                        <div className="flex flex-col gap-2 w-full">
                            <h2 className="text-lg">Address or ENS name</h2>
                            <div className="flex flex-row gap-2 w-full items-center">
                                <Input
                                    defaultValue={config.address}
                                    disabled={config.locked}
                                    placeholder="0xe.....fb49 or vitalik.eth"
                                    onChange={(e) => {
                                        const address = e.target.value.trim().toLowerCase()
                                        updateConfig({
                                            address: address === '' ? undefined : address,
                                        })
                                    }}
                                />
                                {config.address ? (
                                    <Button
                                        className="px-4 py-2 rounded-md"
                                        onClick={() => {
                                            if (!config.address) return
                                            updateConfig({ locked: !config.locked })
                                        }}
                                    >
                                        {config.locked ? 'Unlock' : 'Lock'}
                                    </Button>
                                ) : null}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <h2 className="text-lg">Token Address </h2>
                            <Input
                                defaultValue={config.token?.address}
                                disabled={!config.address}
                                onChange={(e) => {
                                    const address = e.target.value.trim().toLowerCase()
                                    updateConfig({
                                        token: {
                                            ...config.token,
                                            address: address === '' ? undefined : address,
                                        },
                                    })
                                }}
                            />
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <h2 className="text-lg">Token Chain</h2>
                            <Select
                                defaultValue={config.token?.chain}
                                disabled={!config.token?.address}
                                onValueChange={async (chain: ChainKey) => {
                                    if (!config.token?.address) return
                                    try {
                                        const symbol = await getTokenSymbol(
                                            config.token.address,
                                            chain
                                        )
                                        updateConfig({
                                            token: {
                                                ...config.token,
                                                chain,
                                                symbol,
                                            },
                                        })
                                    } catch (e) {
                                        const error = e as Error
                                        toast.error(error.message)
                                    }
                                }}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select Chain" />
                                </SelectTrigger>
                                <SelectContent>
                                    {supportedChains.map((chain) => (
                                        <SelectItem key={chain.id} value={chain.key}>
                                            {chain.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {showTokenFields ? (
                            <div className="flex flex-col gap-4 w-full">
                                <h2 className="text-lg">Amount Raising</h2>
                                <div className="flex flex-col gap-2 w-full">
                                    <div className="flex flex-row items-center justify-between gap-2 ">
                                        <Label className="font-md" htmlFor="predefined-amounts">
                                            Enable predefined amounts?
                                        </Label>
                                        <Switch
                                            id="predefined-amounts"
                                            checked={config.enablePredefinedAmounts}
                                            onCheckedChange={(enablePredefinedAmounts) => {
                                                updateConfig({
                                                    enablePredefinedAmounts,
                                                })
                                            }}
                                        />
                                    </div>

                                    {config.enablePredefinedAmounts ? (
                                        <div className="flex flex-col gap-2">
                                            <div className="flex flex-col w-full gap-2">
                                                <label className="block uppercase tracking-wide text-gray-200 text-xs font-bold mb-2">
                                                    Amount Raising {config.tokenSymbol}
                                                </label>
                                                <div className="flex flex-row w-full items-center gap-2">
                                                    <Input
                                                        disabled={disableAmountsField}
                                                        ref={amountInputRef}
                                                        className="text-lg border rounded py-2 px-4 w-full"
                                                        type="number"
                                                    />
                                                    {!disableAmountsField ? (
                                                        <Button
                                                            type="button"
                                                            disabled={disableAmountsField}
                                                            className="px-4 py-2 rounded-md"
                                                            onClick={() => {
                                                                if (
                                                                    !amountInputRef.current ||
                                                                    amounts.length >= 2
                                                                )
                                                                    return

                                                                const amount =
                                                                    amountInputRef.current.value.trim()

                                                                if (
                                                                    isNaN(Number(amount)) ||
                                                                    Number(amount) < 0
                                                                ) {
                                                                    toast.error('Invalid amount')
                                                                    return
                                                                }

                                                                updateConfig({
                                                                    amounts: [
                                                                        ...amounts,
                                                                        Number(amount),
                                                                    ],
                                                                })

                                                                amountInputRef.current.value = ''
                                                            }}
                                                        >
                                                            Add amount
                                                        </Button>
                                                    ) : null}
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <h2 className="text-2xl font-semibold">
                                                    Manage Predefined amounts
                                                </h2>
                                                {!amounts.length ? (
                                                    <p className="italic text-gray-300">
                                                        No amounts added yet!
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
                                                                    config.token?.symbol!
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
                    </>
                )
            }

            case 'success': {
                return (
                    <div className="flex flex-col gap-4 w-full">
                        <TextSlide
                            cover={successType}
                            setCover={setSuccessType}
                            slide="Success"
                            // key={tab.key}
                            image={config.success.image}
                            fontSize={successTitleFontSize}
                            setFontSize={setSuccessTitleFontSize}
                            subtitleFontSize={successDescriptionFontSize}
                            setSubtitleFontSize={setSuccessDescriptionFontSize}
                            cmFontSize={successMesaageFontSize}
                            setCmFontSize={setSuccessMessageFontSize}
                        />
                    </div>
                )
            }

            case 'about': {
                return (
                    <div className="flex flex-col gap-4 w-full">
                        <TextSlide
                            cover={aboutType}
                            setCover={setAboutType}
                            slide="About"
                            // key={tab.key}
                            image={config.about.image}
                            fontSize={aboutTitleFontSize}
                            setFontSize={setAboutTitleFontSize}
                            subtitleFontSize={aboutDescriptionFontSize}
                            setSubtitleFontSize={setAboutDescriptionFontSize}
                            cmFontSize={aboutMesaageFontSize}
                            setCmFontSize={setAboutMessageFontSize}
                        />
                    </div>
                )
            }

            case 'progress': {
                return (
                    <div className="flex flex-col gap-2 w-full">
                        {JSON.stringify(config, null, 2)}
                        <h2 className="text-lg font-semibold">Progress bar Color</h2>
                        <ColorPicker
                            className="w-full"
                            background={config?.barColor || 'yellow'}
                            setBackground={(barColor) => {
                                updateConfig({
                                    barColor,
                                })
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
                )
            }

            default: {
                return (
                    <div className="flex flex-col gap-4 w-full">
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
                        <div className="flex">
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

                                                const filePath = await uploadImage({
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
                                    <div className="flex flex-col gap-2 w-full">
                                        <div className="flex flex-col w-full">
                                            <h2 className="text-lg">Title</h2>
                                            <Input
                                                className="py-2 text-lg"
                                                defaultValue={config.cover.title}
                                                onChange={async (e) => {
                                                    const title = e.target.value.trim()
                                                    if (title === '') {
                                                        toast.error('A title is required')
                                                        return
                                                    }
                                                    updateConfig({
                                                        cover: {
                                                            ...config.cover,
                                                            title,
                                                        },
                                                    })
                                                }}
                                                placeholder="title"
                                            />
                                        </div>
                                        <div className="flex flex-col w-full">
                                            <h2 className="text-lg">Subtitle</h2>
                                            <Input
                                                className="py-2 text-lg"
                                                defaultValue={config.cover.subtitle}
                                                onChange={async (e) => {
                                                    const subtitle = e.target.value.trim()
                                                    if (subtitle === '') {
                                                        toast.error('A subtitle is required')
                                                        return
                                                    }

                                                    updateConfig({
                                                        cover: {
                                                            ...config.cover,
                                                            subtitle,
                                                        },
                                                    })
                                                }}
                                                placeholder="subtitle"
                                            />
                                        </div>
                                        <div className="flex flex-col w-full">
                                            <h2 className="text-lg">Custom Message</h2>
                                            <Input
                                                className="py-2 text-lg"
                                                defaultValue={config.cover.customMessage}
                                                onChange={async (e) => {
                                                    const value = e.target.value.trim()
                                                    updateConfig({
                                                        cover: {
                                                            ...config.cover,
                                                            customMessage:
                                                                value === '' ? null : value,
                                                        },
                                                    })
                                                }}
                                                placeholder="your custom message"
                                            />
                                        </div>
                                    </div>

                                    {/* Styles config */}
                                    <div className="flex flex-col gap-2 w-full">
                                        <h2 className="text-lg text-center">Customizations</h2>
                                        <div className="flex flex-col gap-2 w-full">
                                            <h2 className="text-lg font-semibold">Background</h2>
                                            <ColorPicker
                                                className="w-full"
                                                enabledPickers={['solid', 'gradient', 'image']}
                                                background={config.cover.backgroundColor || 'black'}
                                                setBackground={(backgroundColor) => {
                                                    updateConfig({
                                                        cover: {
                                                            ...config.cover,
                                                            backgroundColor,
                                                        },
                                                    })
                                                }}
                                                uploadBackground={async (
                                                    base64String,
                                                    contentType
                                                ) => {
                                                    const { filePath } = await uploadImage({
                                                        base64String: base64String,
                                                        contentType: contentType,
                                                    })

                                                    return filePath
                                                }}
                                            />
                                        </div>
                                        {/* title */}
                                        <div className="flex flex-col gap-2 w-full">
                                            <h2 className="text-lg font-semibold">Title Color</h2>
                                            <ColorPicker
                                                className="w-full"
                                                background={
                                                    config.cover?.titleStyles?.color || 'white'
                                                }
                                                setBackground={(color) => {
                                                    updateConfig({
                                                        cover: {
                                                            ...config.cover,
                                                            titleStyles: {
                                                                ...config.cover?.titleStyles,
                                                                color,
                                                            },
                                                        },
                                                    })
                                                }}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 w-full">
                                            <label className="text-lg font-semibold">
                                                Title Size ({coverTitleFontSize}px)
                                            </label>

                                            <Slider
                                                defaultValue={[coverTitleFontSize]}
                                                max={140}
                                                step={2}
                                                onValueChange={(newRange) => {
                                                    const size = newRange[0]
                                                    setCoverTitleFontSize(size)
                                                    updateConfig({
                                                        cover: {
                                                            ...config.cover,
                                                            titleStyles: {
                                                                ...config.cover?.titleStyles,
                                                                size,
                                                            },
                                                        },
                                                    })
                                                }}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 w-full">
                                            <h2 className="text-lg font-semibold">Title Font</h2>
                                            <FontFamilyPicker
                                                defaultValue={
                                                    config.cover?.titleStyles?.font || 'Roboto'
                                                }
                                                onSelect={(font) => {
                                                    updateConfig({
                                                        cover: {
                                                            ...config.cover,
                                                            titleStyles: {
                                                                ...config.cover?.titleStyles,
                                                                font,
                                                            },
                                                        },
                                                    })
                                                }}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 w-full">
                                            <h2 className="text-lg font-semibold">Title Style</h2>
                                            <FontStylePicker
                                                currentFont={
                                                    config.cover?.titleStyles?.font || 'Roboto'
                                                }
                                                defaultValue={
                                                    config.cover?.titleStyles?.style || 'normal'
                                                }
                                                onSelect={(style: string) => {
                                                    updateConfig({
                                                        cover: {
                                                            ...config.cover,
                                                            titleStyles: {
                                                                ...config.cover?.titleStyles,
                                                                style,
                                                            },
                                                        },
                                                    })
                                                }}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 w-full">
                                            <h2 className="text-lg font-semibold">Title Weight</h2>
                                            <FontWeightPicker
                                                currentFont={
                                                    config.cover?.titleStyles?.font || 'Roboto'
                                                }
                                                defaultValue={
                                                    config.cover?.titleStyles?.weight || 'normal'
                                                }
                                                onSelect={(weight) => {
                                                    updateConfig({
                                                        cover: {
                                                            ...config.cover,
                                                            titleStyles: {
                                                                ...config.cover?.titleStyles,
                                                                weight,
                                                            },
                                                        },
                                                    })
                                                }}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 w-full">
                                            <h2 className="text-lg font-semibold">
                                                Title Position
                                            </h2>
                                            <Select
                                                defaultValue={
                                                    config.cover?.titleStyles?.alignment || 'center'
                                                }
                                                onValueChange={(
                                                    alignment: 'left' | 'center' | 'right'
                                                ) => {
                                                    updateConfig({
                                                        cover: {
                                                            ...config.cover,
                                                            titleStyles: {
                                                                ...config.cover?.titleStyles,
                                                                alignment,
                                                            },
                                                        },
                                                    })
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Left" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value={'left'}>Left</SelectItem>
                                                    <SelectItem value={'center'}>Center</SelectItem>
                                                    <SelectItem value={'right'}>Right</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        {/* subtitle */}
                                        <div className="flex flex-col gap-2 w-full">
                                            <h2 className="text-lg font-semibold">
                                                Subtitle Color
                                            </h2>
                                            <ColorPicker
                                                className="w-full"
                                                background={
                                                    config.cover?.subtitleStyles?.color || 'white'
                                                }
                                                setBackground={(color) => {
                                                    updateConfig({
                                                        cover: {
                                                            ...config.cover,
                                                            subtitleStyles: {
                                                                ...config.cover?.subtitleStyles,
                                                                color,
                                                            },
                                                        },
                                                    })
                                                }}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 w-full">
                                            <label className="text-lg font-semibold">
                                                Subtitle Size ({coverDescriptionFontSize}px)
                                            </label>
                                            <Slider
                                                defaultValue={[coverDescriptionFontSize]}
                                                max={140}
                                                step={2}
                                                onValueChange={(newRange) => {
                                                    const size = newRange[0]
                                                    setCoverDescriptionFontSize(size)
                                                    updateConfig({
                                                        cover: {
                                                            ...config.cover,
                                                            subtitleStyles: {
                                                                ...config.cover?.subtitleStyles,
                                                                size,
                                                            },
                                                        },
                                                    })
                                                }}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 w-full">
                                            <h2 className="text-lg font-semibold">Subtitle Font</h2>
                                            <FontFamilyPicker
                                                defaultValue={
                                                    config.cover?.titleStyles?.font || 'Roboto'
                                                }
                                                onSelect={(font) => {
                                                    updateConfig({
                                                        cover: {
                                                            ...config.cover,
                                                            subtitleStyles: {
                                                                ...config.cover?.subtitleStyles,
                                                                font,
                                                            },
                                                        },
                                                    })
                                                }}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 w-full">
                                            <h2 className="text-lg font-semibold">
                                                Subtitle Style
                                            </h2>
                                            <FontStylePicker
                                                currentFont={
                                                    config.cover?.titleStyles?.font || 'Roboto'
                                                }
                                                defaultValue={
                                                    config.cover?.titleStyles?.style || 'normal'
                                                }
                                                onSelect={(style) => {
                                                    updateConfig({
                                                        cover: {
                                                            ...config.cover,
                                                            subtitleStyles: {
                                                                ...config.cover?.subtitleStyles,
                                                                style,
                                                            },
                                                        },
                                                    })
                                                }}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 w-full">
                                            <h2 className="text-lg font-semibold">
                                                Subtitle Weight
                                            </h2>
                                            <FontWeightPicker
                                                currentFont={
                                                    config.cover?.titleStyles?.font || 'Roboto'
                                                }
                                                defaultValue={
                                                    config.cover?.titleStyles?.weight || 'normal'
                                                }
                                                onSelect={(weight) => {
                                                    updateConfig({
                                                        cover: {
                                                            ...config.cover,
                                                            subtitleStyles: {
                                                                ...config.cover?.subtitleStyles,
                                                                weight,
                                                            },
                                                        },
                                                    })
                                                }}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 w-full">
                                            <h2 className="text-lg font-semibold">
                                                Subtitle Position
                                            </h2>
                                            <Select
                                                defaultValue={
                                                    config.cover?.titleStyles?.alignment || 'center'
                                                }
                                                onValueChange={(
                                                    alignment: 'left' | 'center' | 'right'
                                                ) => {
                                                    updateConfig({
                                                        cover: {
                                                            ...config.cover,
                                                            subtitleStyles: {
                                                                ...config.cover?.subtitleStyles,
                                                                alignment,
                                                            },
                                                        },
                                                    })
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Left" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value={'left'}>Left</SelectItem>
                                                    <SelectItem value={'center'}>Center</SelectItem>
                                                    <SelectItem value={'right'}>Right</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        {/* custom message */}
                                        <div className="flex flex-col gap-2 w-full">
                                            <h2 className="text-lg font-semibold">
                                                Custom Message Color
                                            </h2>
                                            <ColorPicker
                                                className="w-full"
                                                background={
                                                    config.cover?.customStyles?.color || 'white'
                                                }
                                                setBackground={(color) => {
                                                    updateConfig({
                                                        cover: {
                                                            ...config.cover,
                                                            customStyles: {
                                                                ...config.cover?.customStyles,
                                                                color,
                                                            },
                                                        },
                                                    })
                                                }}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 w-full">
                                            <label className="text-lg font-semibold">
                                                Custom Message Size ({coverMessageFontSize}px)
                                            </label>
                                            <Slider
                                                defaultValue={[coverMessageFontSize]}
                                                max={140}
                                                step={2}
                                                onValueChange={(newRange) => {
                                                    const size = newRange[0]
                                                    setCoverMessageFontSize(size)
                                                    updateConfig({
                                                        cover: {
                                                            ...config.cover,
                                                            customStyles: {
                                                                ...config.cover?.customStyles,
                                                                size,
                                                            },
                                                        },
                                                    })
                                                }}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 w-full">
                                            <h2 className="text-lg font-semibold">
                                                Custom Message Font
                                            </h2>
                                            <FontFamilyPicker
                                                defaultValue={
                                                    config.cover?.customStyles?.font || 'Roboto'
                                                }
                                                onSelect={(font) => {
                                                    updateConfig({
                                                        cover: {
                                                            ...config.cover,
                                                            customStyles: {
                                                                ...config.cover?.customStyles,
                                                                font,
                                                            },
                                                        },
                                                    })
                                                }}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 w-full">
                                            <h2 className="text-lg font-semibold">
                                                Custom Message Style
                                            </h2>
                                            <FontStylePicker
                                                currentFont={
                                                    config.cover?.customStyles?.font || 'Roboto'
                                                }
                                                defaultValue={
                                                    config.cover?.customStyles?.style || 'normal'
                                                }
                                                onSelect={(style) => {
                                                    updateConfig({
                                                        cover: {
                                                            ...config.cover,
                                                            customStyles: {
                                                                ...config.cover?.customStyles,
                                                                style,
                                                            },
                                                        },
                                                    })
                                                }}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 w-full">
                                            <h2 className="text-lg font-semibold">
                                                Custom Message Weight
                                            </h2>
                                            <FontWeightPicker
                                                currentFont={
                                                    config.cover?.customStyles?.font || 'Roboto'
                                                }
                                                defaultValue={
                                                    config.cover?.customStyles?.weight || 'normal'
                                                }
                                                onSelect={(weight) => {
                                                    updateConfig({
                                                        cover: {
                                                            ...config.cover,
                                                            customStyles: {
                                                                ...config.cover?.customStyles,
                                                                weight,
                                                            },
                                                        },
                                                    })
                                                }}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 w-full">
                                            <h2 className="text-lg font-semibold">
                                                Custom Message Position
                                            </h2>
                                            <Select
                                                defaultValue={
                                                    config.cover?.customStyles?.alignment ||
                                                    'center'
                                                }
                                                onValueChange={(
                                                    alignment: 'left' | 'center' | 'right'
                                                ) => {
                                                    updateConfig({
                                                        cover: {
                                                            ...config.cover,
                                                            customStyles: {
                                                                ...config.cover?.customStyles,
                                                                alignment,
                                                            },
                                                        },
                                                    })
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Left" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value={'left'}>Left</SelectItem>
                                                    <SelectItem value={'center'}>Center</SelectItem>
                                                    <SelectItem value={'right'}>Right</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )
            }
        }
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
