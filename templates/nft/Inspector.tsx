'use client'
import { Button, GatingInspector, Input, Label } from '@/sdk/components'
import { useFarcasterId, useFrameConfig, useResetPreview, useUploadImage } from '@/sdk/hooks'
import { Configuration } from '@/sdk/inspector'
import { TrashIcon, UploadIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Config } from '.'
import type { NFT } from './types'

export default function Inspector() {
    const [config, updateConfig] = useFrameConfig<Config>()
    const fid = useFarcasterId()
    const uploadImage = useUploadImage()
    const resetPreview = useResetPreview()

    const addNFT = () => {
        const newNFT: NFT = {
            contractAddress: '',
            tokenId: '',
            name: '',
            description: '',
            imageUrl: '',
        }
        updateConfig({ nfts: [...config.nfts, newNFT] })
    }

    const updateNFT = (index: number, field: keyof NFT, value: string) => {
        const updatedNFTs = [...config.nfts]
        updatedNFTs[index] = { ...updatedNFTs[index], [field]: value }
        updateConfig({ nfts: updatedNFTs })
    }

    const removeNFT = (index: number) => {
        const updatedNFTs = config.nfts.filter((_, i) => i !== index)
        updateConfig({ nfts: updatedNFTs })
    }

    const uploadImageFile = (file: File, onSuccess: (filePath: string) => void) => {
        const reader = new FileReader()
        reader.onloadend = async () => {
            try {
                const base64String = reader.result as string
                const { filePath } = await uploadImage({
                    base64String: base64String.split(',')[1],
                    contentType: file.type,
                })
                onSuccess(filePath)
            } catch (error) {
                console.error('Error uploading image:', error)
                toast.error('Failed to upload image')
            }
        }
        reader.readAsDataURL(file)
    }

    return (
        <Configuration.Root>
            <Configuration.Section name="General" description="Basic marketplace settings">
                <Input
                    name="title"
                    label="Marketplace Title"
                    value={config.title}
                    onChange={(e) => updateConfig({ title: e.target.value })}
                />
                <Input
                    name="description"
                    label="Marketplace Description"
                    value={config.description}
                    onChange={(e) => updateConfig({ description: e.target.value })}
                />
                <div className="mt-4">
                    <Label htmlFor="coverImage" className="block mb-2">
                        Cover Image
                    </Label>
                    <div className="flex items-center space-x-2">
                        <input
                            id="coverImage"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                    uploadImageFile(file, (filePath) => {
                                        updateConfig({ coverImage: filePath })
                                    })
                                }
                            }}
                        />
                        <Button
                            onClick={() => document.getElementById('coverImage')?.click()}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            <UploadIcon className="w-4 h-4" />
                            <span>Upload Image</span>
                        </Button>
                        {config.coverImage && (
                            <span className="text-sm text-gray-500">Image uploaded</span>
                        )}
                    </div>
                </div>
            </Configuration.Section>

            <Configuration.Section name="NFTs" description="Add and manage NFTs">
                {config.nfts.map((nft, index) => (
                    <div key={index} className="mb-6 p-4 border rounded ">
                        <Input
                            label="Contract Address"
                            value={nft.contractAddress}
                            onChange={(e) => updateNFT(index, 'contractAddress', e.target.value)}
                            className="w-full p-2 border rounded mb-2"
                            placeholder="e.g., 0x123...abc"
                        />
                        <Input
                            label="Token ID"
                            value={nft.tokenId}
                            onChange={(e) => updateNFT(index, 'tokenId', e.target.value)}
                            className="w-full p-2 border rounded mb-2"
                            placeholder="e.g., 1234"
                        />
                        <Input
                            label="Name"
                            value={nft.name}
                            onChange={(e) => updateNFT(index, 'name', e.target.value)}
                            className="w-full p-2 border rounded mb-2"
                            placeholder="e.g., My Awesome NFT"
                        />
                        <Input
                            label="Description"
                            value={nft.description}
                            onChange={(e) => updateNFT(index, 'description', e.target.value)}
                            className="w-full p-2 border rounded mb-2"
                            placeholder="e.g., This is a unique digital collectible..."
                        />
                        <div className="mb-2">
                            <Label htmlFor={`nft-image-${index}`} className="block mb-2">
                                NFT Image
                            </Label>
                            <div className="flex items-center space-x-2">
                                <input
                                    id={`nft-image-${index}`}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        if (file) {
                                            handleImageUpload(index, file)
                                        }
                                    }}
                                />
                                <Button
                                    onClick={() =>
                                        document.getElementById(`nft-image-${index}`)?.click()
                                    }
                                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    <UploadIcon className="w-4 h-4" />
                                    <span>Upload Image</span>
                                </Button>
                                {nft.imageUrl && (
                                    <span className="text-sm text-gray-500">Image uploaded</span>
                                )}
                            </div>
                        </div>
                        <Button
                            onClick={() => removeNFT(index)}
                            className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                            <TrashIcon className="w-4 h-4" />
                            <span>Remove NFT</span>
                        </Button>
                    </div>
                ))}
                <Button
                    onClick={addNFT}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                    <span>Add NFT</span>
                </Button>
            </Configuration.Section>

            <Configuration.Section name="Success">
                <Input
                    name="successTitle"
                    label="Success Title"
                    value={config.successTitle}
                    onChange={(e) => updateConfig({ successTitle: e.target.value })}
                    placeholder="e.g., Uhulll.."
                    className="w-full p-2 border rounded mb-2"
                />
                <Input
                    name="successSubtitle"
                    label="Success Subtitle"
                    value={config.successSubtitle}
                    onChange={(e) => updateConfig({ successSubtitle: e.target.value })}
                    placeholder="e.g., Success seller, success Buy"
                    className="w-full p-2 border rounded mb-2"
                />
                <div>
                    <Label htmlFor="successBackground" className="block mb-2">
                        Success Background
                    </Label>
                    <div className="flex items-center space-x-2">
                        <input
                            id="successBackground"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                    uploadImageFile(file, (filePath) => {
                                        updateConfig({ successBackground: filePath })
                                    })
                                }
                            }}
                        />
                        <Button
                            onClick={() => document.getElementById('successBackground')?.click()}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            <UploadIcon className="w-4 h-4" />
                            <span>Upload Background</span>
                        </Button>
                        {config.successBackground && (
                            <span className="text-sm text-gray-500">Background uploaded</span>
                        )}
                    </div>
                </div>
            </Configuration.Section>

            <Configuration.Section name="Gating" description="Configure access control">
                <GatingInspector
                    config={config.gating}
                    onUpdate={(gatingConfig) => updateConfig({ gating: gatingConfig })}
                />
            </Configuration.Section>
        </Configuration.Root>
    )
}
