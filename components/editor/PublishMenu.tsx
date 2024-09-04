import { Button } from '@/components/shadcn/Button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/shadcn/Popover'
import type { frameTable } from '@/db/schema'
import { publishFrameConfig, revertFrameConfig } from '@/lib/frame'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import type { InferSelectModel } from 'drizzle-orm'
import { CopyIcon, ImageUpIcon, Undo2Icon } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { BaseInput } from '../shadcn/BaseInput'

dayjs.extend(relativeTime)

export default function PublishMenu({
    frame,
}: {
    frame: InferSelectModel<typeof frameTable>
}) {
    const [updating, setUpdating] = useState(false)

    async function publishConfig() {
        setUpdating(true)
        await publishFrameConfig(frame.id)
        setUpdating(false)
    }

    async function revertConfig() {
        setUpdating(true)
        await revertFrameConfig(frame.id)
        setUpdating(false)
    }
    return (
        <Popover>
            <PopoverTrigger asChild={true}>
                <Button variant={'primary'}>Publish</Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 md:mr-5 max-md:w-screen">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-row gap-2 justify-between">
                        <h4 className="text-lg font-medium leading-none">Publish</h4>
                        {updating ? (
                            <div className="w-4 h-4 rounded-full border-2 animate-spin border-muted-foreground border-r-transparent" />
                        ) : (
                            // <p className="text-xs text-muted-foreground">4 minutes ago</p>
                            <p className="text-xs text-muted-foreground">
                                {dayjs(frame.updatedAt).fromNow()}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-row gap-2 justify-between">
                        <BaseInput
                            // className="bg-surface hover:ring-0 focus:ring-0"
                            value={process.env.NEXT_PUBLIC_HOST! + '/f/' + frame.id}
                            contentEditable={false}
                            readOnly={true}
                        />
                        <Button
                            variant="outline"
                            className="h-14"
                            onClick={() => {
                                navigator.clipboard.writeText(
                                    `${process.env.NEXT_PUBLIC_HOST}/f/${frame.id}`
                                )
                                toast.success('Copied to clipboard!')
                            }}
                        >
                            <CopyIcon />
                        </Button>
                    </div>
                    <div className="flex flex-col gap-0">
                        <Button
                            variant="primary"
                            className="flex flex-row gap-1 text-base"
                            onClick={async () => {
                                await publishConfig()
                                toast.success('Published!')
                            }}
                        >
                            PUBLISH <ImageUpIcon size={18} />
                        </Button>

                        <Button
                            variant="link"
                            className="flex flex-row gap-1 items-baseline text-destructive"
                            onClick={async () => {
                                await revertConfig()
                                toast.success('Reverted!')
                            }}
                        >
                            <Undo2Icon size={12} />
                            Revert to old version
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
