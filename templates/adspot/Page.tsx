import type { frameTable } from '@/db/schema'
import { Button, Table } from '@/sdk/components'
import type { InferSelectModel } from 'drizzle-orm'
import type { Config, Storage } from '.'
import { formatSymbol } from './utils'

export default async function Page({
    frame,
    user,
}: {
    frame: InferSelectModel<typeof frameTable>
    user: { fid: string; username: string } | undefined
}) {
    const config = frame.config as Config
    const storage = frame.storage as Storage
    const isOwner = user?.fid === config.fid?.toString()
    return (
        <div className="flex flex-col gap-5 w-full h-full">
            <div className="flex flex-col justify-between items-center">
                <div className="text-4xl">Ad Spot ({config.mode.toUpperCase()})</div>
            </div>
            <div className="mt-10">
                <div className="bg-gray-50 border rounded-xl overflow-hidden">
                    <div className="relative rounded-xl overflow-auto p-8 space-y-4">
                        <div
                            className="max-w-lg mx-auto h-80 w-full overflow-y-scroll bg-cover shadow-lg"
                            style={{
                                backgroundImage: storage.ad?.image
                                    ? `url(${storage.ad.image})`
                                    : undefined,
                                backgroundPosition: 'center -80px',
                            }}
                        >
                            <div className="mt-40">
                                <Table.Root>
                                    <Table.Header>
                                        <Table.Row>
                                            <Table.Head className="w-[100px]">Time</Table.Head>
                                            <Table.Head>FID</Table.Head>
                                            <Table.Head>Amount</Table.Head>
                                            {isOwner && (
                                                <Table.Head className="text-right">
                                                    Actions
                                                </Table.Head>
                                            )}{' '}
                                        </Table.Row>
                                    </Table.Header>

                                    {(storage.bids || []).length ? (
                                        storage.bids.map((bid) => {
                                            return (
                                                <Table.Body key={bid.id}>
                                                    <Table.Row>
                                                        <Table.Cell className="font-medium w-[25%]">
                                                            {new Date(bid.ts).toLocaleString()}
                                                        </Table.Cell>
                                                        <Table.Cell className="font-medium w-[25%]">
                                                            {bid.fid}
                                                        </Table.Cell>
                                                        <Table.Cell className="font-medium w-[25%]">
                                                            {formatSymbol(
                                                                bid.amount,
                                                                `${config.token!.symbol}`
                                                            )}
                                                        </Table.Cell>
                                                        {isOwner && (
                                                            <Table.Cell className="text-right w-[25%]">
                                                                <div className="flex flex-row items-center justify-end">
                                                                    <Button>Approve</Button>
                                                                </div>
                                                            </Table.Cell>
                                                        )}
                                                    </Table.Row>
                                                </Table.Body>
                                            )
                                        })
                                    ) : (
                                        <Table.Caption>
                                            <div className="text-2xl">No bids yet!</div>
                                        </Table.Caption>
                                    )}
                                </Table.Root>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
