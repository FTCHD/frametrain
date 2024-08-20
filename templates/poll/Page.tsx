import { Button } from '@/components/shadcn/Button'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/shadcn/Table'
import type { frameTable } from '@/db/schema'
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

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Time</TableHead>
                        <TableHead>FID</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead className="text-right">Vote</TableHead>
                    </TableRow>
                </TableHeader>

                {frame.storage?.votesForId ? (
                    Object.keys(frame.storage?.votesForId).map((fid) => {
                        const currentVote = frame.storage!.votesForId[fid]

                        return (
                            <TableBody key={fid}>
                                <TableRow>
                                    <TableCell className="font-medium w-[25%]">
                                        {new Date(currentVote.timestamp).toLocaleString()}
                                    </TableCell>
                                    <TableCell className="font-medium w-[25%]">{fid}</TableCell>
                                    <TableCell className="font-medium w-[25%]">
                                        {user?.fid === fid ? 'You' : currentVote.username}
                                    </TableCell>
                                    <TableCell className="text-right w-[25%]">
                                        {
                                            frame.config?.options[currentVote.option - 1]
                                                ?.displayLabel
                                        }
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        )
                    })
                ) : (
                    <TableCaption>
                        <div className="text-2xl">No votes yet!</div>
                    </TableCaption>
                )}
            </Table>
        </div>
    )
}
