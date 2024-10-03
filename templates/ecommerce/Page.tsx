import type { frameTable } from '@/db/schema'
import { Button, Table } from '@/sdk/components'
import type { InferSelectModel } from 'drizzle-orm'
import NextLink from 'next/link'
import type { Config, Storage } from '.'
import { getSliceProducts } from './common/slice'

export default async function Page({
    frame,
    user,
}: {
    frame: InferSelectModel<typeof frameTable>
    user: { fid: string; username: string } | undefined
}) {
    const config = frame.config as Config
    const storage = frame.storage as Storage

    if (!config.storeInfo?.products.length) {
        return (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'black',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    fontFamily: 'Roboto',
                    fontSize: '50px',
                    color: '#ffffff',
                }}
            >
                Sorry, this store has no products at the moment
            </div>
        )
    }

    const isOwner = user?.fid === frame.owner
    const products = await getSliceProducts(config.storeInfo.id)
    const purchases = storage.purchases || []

    console.log({ isOwner, fid: user?.fid, owner: frame.owner })

    return (
        <div className="flex flex-col gap-5 w-full h-full">
            <div className="flex flex-row justify-between items-center">
                <div className="text-4xl">{`${config.storeInfo.name} Products`}</div>
                <NextLink
                    href={`https://warpcast.com/~/compose?embeds%5B%5D=${process.env.NEXT_PUBLIC_HOST}%2Ff%2F${frame.id}&text=Yo!%2C%20Check%20out%20this%20store%20It%20has%20products%20that%20you%20can%20buy%3F`}
                    target="_blank"
                >
                    <Button variant={'primary'}>Share Store</Button>
                </NextLink>
            </div>

            <Table.Root>
                <Table.Header>
                    <Table.Row>
                        <Table.Head className="w-[100px]">Name</Table.Head>
                        <Table.Head>Description</Table.Head>
                        <Table.Head>Stock</Table.Head>
                        <Table.Head className="text-right">Max limit Per Buyer</Table.Head>
                    </Table.Row>
                </Table.Header>

                {products.map((product) => {
                    return (
                        <Table.Body key={product.id}>
                            <Table.Row>
                                <Table.Cell className="font-medium w-[25%]">
                                    <NextLink
                                        href={`https://shop.slice.so/store/${
                                            config.storeInfo!.id
                                        }?productId=${product.id.split('-')[1]}`}
                                        target="_blank"
                                    >
                                        {product.title.toUpperCase()}
                                    </NextLink>
                                </Table.Cell>
                                <Table.Cell className="font-medium w-[25%]">
                                    {product.description}
                                </Table.Cell>
                                <Table.Cell className="font-medium w-[25%]">
                                    {product.isInfinite ? 'Unlimited' : product.remainingUnits}
                                </Table.Cell>
                                <Table.Cell className="text-right w-[25%]">
                                    {product.isInfinite ? 'Unlimited' : product.maxPerBuyer}
                                </Table.Cell>
                            </Table.Row>
                        </Table.Body>
                    )
                })}
            </Table.Root>

            {isOwner ? (
                <>
                    <div className="flex flex-row justify-between items-center">
                        <div className="text-4xl">
                            <div className="text-4xl">{`${config.storeInfo.name} Purchases`}</div>
                        </div>
                    </div>

                    <Table.Root>
                        <Table.Header>
                            <Table.Row>
                                <Table.Head className="w-[100px]">Product Name</Table.Head>
                                <Table.Head>Buyer</Table.Head>
                                <Table.Head>Variant</Table.Head>
                                <Table.Head>Quantity</Table.Head>
                                <Table.Head>Transaction</Table.Head>
                                <Table.Head className="text-right">Time</Table.Head>
                            </Table.Row>
                        </Table.Header>

                        {purchases.length ? (
                            purchases.map((purchase) => {
                                const product = products.find(
                                    (p) => p.id === purchase.productId
                                ) || {
                                    id: 0,
                                    title: 'Unknown',
                                    description: 'Unknown',
                                    isInfinite: false,
                                    remainingUnits: 0,
                                    maxPerBuyer: 0,
                                }

                                return (
                                    <Table.Body key={purchase.tx}>
                                        <Table.Row>
                                            <Table.Cell className="font-medium w-[25%]">
                                                <NextLink
                                                    href={`https://shop.slice.so/store/${
                                                        config.storeInfo!.id
                                                    }?productId=${product.id}`}
                                                    target="_blank"
                                                >
                                                    {product.title.toUpperCase()}
                                                </NextLink>
                                            </Table.Cell>
                                            <Table.Cell className="font-medium w-[25%]">
                                                <NextLink
                                                    href={`https://warpcast.com/${user.username}`}
                                                    target="_blank"
                                                >
                                                    {user.fid} ({user.username})
                                                </NextLink>
                                            </Table.Cell>
                                            <Table.Cell className="font-medium w-[25%]">
                                                {purchase.variant || 'N/A'}
                                            </Table.Cell>
                                            <Table.Cell className="font-medium w-[25%]">
                                                {purchase.quantity}
                                            </Table.Cell>
                                            <Table.Cell className="font-medium w-[25%]">
                                                <NextLink
                                                    href={`https://basescan.org/tx/${purchase.tx}`}
                                                    target="_blank"
                                                >
                                                    {purchase.tx}
                                                </NextLink>
                                            </Table.Cell>
                                            <Table.Cell className="text-right w-[25%]">
                                                {new Date(purchase.timestamp).toLocaleString()}
                                            </Table.Cell>
                                        </Table.Row>
                                    </Table.Body>
                                )
                            })
                        ) : (
                            <Table.Caption>
                                <div className="text-2xl">No purchases yet!</div>
                            </Table.Caption>
                        )}
                    </Table.Root>
                </>
            ) : null}
        </div>
    )
}
