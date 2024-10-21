'use client'

import type { frameTable } from '@/db/schema'
import { updateFrameStorage } from '@/lib/frame'
import { Button, Table } from '@/sdk/components'
import type { InferSelectModel } from 'drizzle-orm'
import toast from 'react-hot-toast'
import type { Config, Storage } from '.'
import { formatSymbol } from './utils'

export default function PageClient({
    user,
    frame,
}: {
    user: { fid: string; username: string } | undefined
    frame: InferSelectModel<typeof frameTable>
}) {
    const config = frame.config as Config
    const storage = frame.storage as Storage
    const bids = storage?.bids || []
    const isOwner = user?.fid === config.owner?.fid

    const handleBid = async (id: string, approve = true) => {
        const bid = bids.find((b) => b.id === id)
        if (!bid) {
            toast.error('Bid not found')
        }
        storage.bids = bids.map((b) => {
            if (b.id === id) {
                return {
                    ...b,
                    approved: approve,
                }
            }
            return b
        })

        await updateFrameStorage(frame.id, storage)
        toast.success(`Bid ${approve ? 'approved' : 'rejected'}`)
    }

    const sortedBids = bids.sort((a, b) => b.amount - a.amount) as typeof bids

    return (
        <div className="flex flex-col gap-5 w-full h-full">
            <div className="flex justify-between items-center">
                <div className="text-4xl">Ad Spot ({config.mode.toUpperCase()})</div>
            </div>
            {storage.ad?.image ? (
                <div className="mt-10">
                    <div
                        className="max-w-lg mx-auto h-80 w-full bg-cover shadow-lg"
                        style={{
                            backgroundImage: `url(${storage.ad.image})`,
                            backgroundPosition: 'center -80px',
                            backgroundRepeat: 'no-repeat',
                        }}
                    />
                </div>
            ) : (
                <div className="mt-10">No ad yet</div>
            )}
            <div className="mt-40">
                {bids.length ? (
                    <div className="text-4xl">
                        Number of bids: {bids.length} at{' '}
                        {formatSymbol(
                            bids.reduce((a, b) => a + b.amount, 0),
                            config.token!.symbol + ''
                        )}
                        {config.mode === 'auction' && ' (estimates)'}
                    </div>
                ) : null}

                <Table.Root>
                    <Table.Header>
                        <Table.Row>
                            <Table.Head className="w-[100px]">ID</Table.Head>
                            <Table.Head>FID</Table.Head>
                            <Table.Head>Amount</Table.Head>
                            <Table.Head>Approved</Table.Head>
                            <Table.Head className="w-[100px]">Current bid</Table.Head>
                            <Table.Head className="w-[100px]">Tx ID</Table.Head>
                            <Table.Head className="w-[100px]">Time</Table.Head>
                            {isOwner && <Table.Head className="text-right">Actions</Table.Head>}
                        </Table.Row>
                    </Table.Header>

                    {sortedBids.length ? (
                        sortedBids.map((bid) => {
                            return (
                                <Table.Body key={bid.id}>
                                    <Table.Row>
                                        <Table.Cell className="font-medium w-[25%]">
                                            {bid.id}
                                        </Table.Cell>
                                        <Table.Cell className="font-medium w-[25%]">
                                            {bid.fid}
                                        </Table.Cell>
                                        <Table.Cell className="font-medium w-[25%]">
                                            {formatSymbol(bid.amount, `${config.token!.symbol}`)}
                                        </Table.Cell>
                                        <Table.Cell className="font-medium w-[25%]">
                                            {bid.approved ? 'YES' : 'NO'}
                                        </Table.Cell>
                                        <Table.Cell className="font-medium w-[25%]">
                                            {bid.id === storage.currentBid ? 'YES' : 'NO'}
                                        </Table.Cell>
                                        <Table.Cell className="font-medium w-[25%]">
                                            {bid.tx ? (
                                                <a
                                                    href={`http://basescan.org/tx/${bid.tx}`}
                                                    target="blank"
                                                >
                                                    {bid.tx}
                                                </a>
                                            ) : (
                                                'N/A'
                                            )}
                                        </Table.Cell>
                                        <Table.Cell className="font-medium w-[25%]">
                                            {new Date(bid.ts).toLocaleString()}
                                        </Table.Cell>
                                        {isOwner && (
                                            <Table.Cell className="text-right w-[25%]">
                                                {bid.id === storage.winningBid ? (
                                                    'No actions for continuous bids'
                                                ) : (
                                                    <div className="flex flex-row gap-2 items-center justify-between">
                                                        <Button
                                                            disabled={bid.approved}
                                                            variant={
                                                                bid.approved ? 'default' : undefined
                                                            }
                                                            onClick={() => handleBid(bid.id)}
                                                        >
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            onClick={() => handleBid(bid.id, false)}
                                                        >
                                                            Decline
                                                        </Button>
                                                    </div>
                                                )}
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
    )
}
