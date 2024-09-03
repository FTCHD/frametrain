import type { frameTable } from '@/db/schema'
import { Button, Table } from '@/sdk/components'
import type { InferSelectModel } from 'drizzle-orm'
import NextLink from 'next/link'

export default async function Page({
    frame,
    user,
}: {
    frame: InferSelectModel<typeof frameTable>
    user: { fid: string; username: string } | undefined
}) {
    return (
        <div className="flex flex-col gap-5 w-full h-full">
            <div className="flex flex-row justify-between items-center">
                <div className="text-4xl">{frame.config?.question || 'Question'}</div>
                <NextLink
                    href={`https://warpcast.com/~/compose?embeds%5B%5D=${process.env.NEXT_PUBLIC_HOST}%2Ff%2F${frame.id}&text=Hmmm%2C%20what%20do%20you%20think%3F`}
                    target="_blank"
                >
                    <Button variant={'primary'}>Share Poll</Button>
                </NextLink>
            </div>

            <Table.Root>
                <Table.Header>
                    <Table.Row>
                        <Table.Head className="w-[100px]">Time</Table.Head>
                        <Table.Head>FID</Table.Head>
                        <Table.Head>User</Table.Head>
                        <Table.Head className="text-right">Vote</Table.Head>
                    </Table.Row>
                </Table.Header>

                {frame.storage?.votesForId ? (
                    Object.keys(frame.storage?.votesForId).map((fid) => {
                        const currentVote = frame.storage!.votesForId[fid]

                        return (
                            <Table.Body key={fid}>
                                <Table.Row>
                                    <Table.Cell className="font-medium w-[25%]">
                                        {new Date(currentVote.timestamp).toLocaleString()}
                                    </Table.Cell>
                                    <Table.Cell className="font-medium w-[25%]">{fid}</Table.Cell>
                                    <Table.Cell className="font-medium w-[25%]">
                                        {user?.fid === fid ? 'You' : currentVote.username}
                                    </Table.Cell>
                                    <Table.Cell className="text-right w-[25%]">
                                        {
                                            frame.config?.options[currentVote.option - 1]
                                                ?.displayLabel
                                        }
                                    </Table.Cell>
                                </Table.Row>
                            </Table.Body>
                        )
                    })
                ) : (
                    <Table.Caption>
                        <div className="text-2xl">No votes yet!</div>
                    </Table.Caption>
                )}
            </Table.Root>
        </div>
    )
}
