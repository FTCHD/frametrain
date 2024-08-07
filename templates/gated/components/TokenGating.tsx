'use client'
import { Input } from '@/components/shadcn/Input'
import { Label } from '@/components/shadcn/InputLabel'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/shadcn/Select'
import toast from 'react-hot-toast'

export default function TokenGating({
    onChange,
    defaultValues,
    loading = false,
    id,
}: {
    onChange: (v: {
        network: string | null | undefined
        address: string | null | undefined
        balance: number | null | undefined
        tokenId: string | null | undefined
        collection: string | null | undefined
    }) => void
    defaultValues: {
        network: string | undefined
        address: string | undefined
        balance: number
        tokenId: string | undefined
        collection: string | undefined
    }
    loading?: boolean
    id: 'erc721' | 'erc1155' | 'erc20'
}) {
    return (
        <>
            <div className="flex flex-row items-center w-full gap-2">
                <Label htmlFor="network" className="text-sm font-medium leading-none">
                    Network
                </Label>
                <Select
                    defaultValue={defaultValues.network as string | undefined}
                    onValueChange={(network) => {
                        onChange({ ...defaultValues, network })
                    }}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select network" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ETH">Ethereum MainNet</SelectItem>
                        <SelectItem value="BASE">Base</SelectItem>
                        <SelectItem value="OP">Optimism</SelectItem>
                        <SelectItem value="ZORA">Zora</SelectItem>
                        <SelectItem value="BLAST">Blast</SelectItem>
                        <SelectItem value="POLYGON">Polygon</SelectItem>
                        <SelectItem value="FANTOM">Fantom</SelectItem>
                        <SelectItem value="ARBITRUM">Arbitrum</SelectItem>
                        <SelectItem value="BNB">Bnb</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="flex flex-row items-center w-full gap-2">
                <Label htmlFor="address" className="text-sm font-medium leading-none">
                    Address
                </Label>
                <Input
                    id="address"
                    disabled={loading || !defaultValues.network}
                    type="text"
                    placeholder="0x8c678ghybv...."
                    defaultValue={defaultValues.address}
                    onChange={(e) => {
                        const address = e.target.value
                        onChange({
                            ...defaultValues,
                            address: address.length === 0 ? null : address,
                        })
                    }}
                />
            </div>
            <div className="flex flex-row items-center w-full gap-2">
                <Label htmlFor="balance" className="text-sm font-medium leading-none">
                    Minimum Balance <br /> (optional)
                </Label>
                <Input
                    id="balance"
                    type="number"
                    placeholder="300"
                    disabled={!(defaultValues.address && defaultValues.network)}
                    defaultValue={defaultValues.balance}
                    onChange={(e) => {
                        const value = e.target.value
                        const balance = value === '' ? 0 : Number.parseFloat(value)
                        if (isNaN(balance)) {
                            toast.error('Please enter a valid amount')
                            return
                        }
                        onChange({ ...defaultValues, balance: balance === 0 ? null : balance })
                    }}
                />
            </div>
            {id === 'erc1155' ? (
                <div className="flex flex-row items-center w-full gap-2">
                    <Label htmlFor="tokenId" className="text-sm font-medium leading-none">
                        Token ID
                    </Label>
                    <Input
                        id="tokenId"
                        type="text"
                        placeholder="1"
                        disabled={!(defaultValues.address && defaultValues.network)}
                        defaultValue={defaultValues.tokenId}
                        onChange={(e) => {
                            const tokenId = e.target.value

                            onChange({
                                ...defaultValues,
                                tokenId: tokenId.length === 0 ? null : tokenId,
                            })
                        }}
                    />
                </div>
            ) : null}

            {id !== 'erc20' ? (
                <div className="flex flex-row items-center w-full gap-2">
                    <Label htmlFor="collection" className="text-sm font-medium leading-none">
                        Collection URL
                    </Label>
                    <Input
                        id="collection"
                        type="text"
                        placeholder="https://opensea.io/collection/xyz"
                        disabled={!(defaultValues.address && defaultValues.network)}
                        defaultValue={defaultValues.collection}
                        onChange={(e) => {
                            const collection = e.target.value

                            onChange({
                                ...defaultValues,
                                collection: collection.length === 0 ? null : collection,
                            })
                        }}
                    />
                </div>
            ) : null}
        </>
    )
}