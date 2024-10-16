'use client'
import { BaseInput } from '@/components/shadcn/BaseInput'
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from '@/components/shadcn/ContextMenu'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/shadcn/Dialog'
import { deleteFrame, duplicateFrame, type getRecentFrameList } from '@/lib/frame'
import { Button } from '@/sdk/components'
import { CopyPlusIcon, DeleteIcon, LinkIcon, LoaderIcon } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function ProjectCard({
    frame,
}: { frame: Awaited<ReturnType<typeof getRecentFrameList>>[number] }) {
    const { id, name, template, interactionCount } = frame
    const frameUrl = `${process.env.NEXT_PUBLIC_HOST}/f/${frame.id}`

    const [isDeletingFrame, setIsDeletingFrame] = useState(false)
    const [showDeleteFrameModal, setShowDeleteFrameModal] = useState(false)

    return (
        <Dialog onOpenChange={setShowDeleteFrameModal} open={showDeleteFrameModal}>
            <ContextMenu>
                <ContextMenuTrigger asChild={true}>
                    <a
                        href={`/frame/${id}`}
                        style={{ textDecoration: 'none' }}
                        className="w-[375px] h-[130px] bg-[#ffffff09] p-4  border-[#32383E] border rounded-lg hover:drop-shadow-2xl hover:bg-[#ffffff1a] transition-all duration-300"
                        key={id}
                    >
                        <div className="flex flex-row gap-5 justify-center w-full h-full">
                            <div className="w-[95px] h-[95px]">
                                <img
                                    src={`${process.env.NEXT_PUBLIC_CDN_HOST}/frames/${id}/preview.png`}
                                    alt={name}
                                    className="object-cover object-center rounded-[50px] padding-0 space-0 h-full w-full"
                                    onError={(e) => {
                                        e.currentTarget.srcset = ''
                                        e.currentTarget.src =
                                            'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiB2aWV3Qm94PSIwIDAgMTI0IDEyNCIgZmlsbD0ibm9uZSI+CjxyZWN0IHdpZHRoPSIxMjQiIGhlaWdodD0iMTI0IiByeD0iMjQiIGZpbGw9IiNGOTczMTYiLz4KPHBhdGggZD0iTTE5LjM3NSAzNi43ODE4VjEwMC42MjVDMTkuMzc1IDEwMi44MzQgMjEuMTY1OSAxMDQuNjI1IDIzLjM3NSAxMDQuNjI1SDg3LjIxODFDOTAuNzgxOCAxMDQuNjI1IDkyLjU2NjQgMTAwLjMxNiA5MC4wNDY2IDk3Ljc5NjZMMjYuMjAzNCAzMy45NTM0QzIzLjY4MzYgMzEuNDMzNiAxOS4zNzUgMzMuMjE4MiAxOS4zNzUgMzYuNzgxOFoiIGZpbGw9IndoaXRlIi8+CjxjaXJjbGUgY3g9IjYzLjIxMDkiIGN5PSIzNy41MzkxIiByPSIxOC4xNjQxIiBmaWxsPSJibGFjayIvPgo8cmVjdCBvcGFjaXR5PSIwLjQiIHg9IjgxLjEzMjgiIHk9IjgwLjcxOTgiIHdpZHRoPSIxNy41Njg3IiBoZWlnaHQ9IjE3LjM4NzYiIHJ4PSI0IiB0cmFuc2Zvcm09InJvdGF0ZSgtNDUgODEuMTMyOCA4MC43MTk4KSIgZmlsbD0iI0ZEQkE3NCIvPgo8L3N2Zz4='
                                        e.currentTarget.style.objectFit = 'contain'
                                    }}
                                />
                            </div>
                            <div className="flex flex-col gap-4 items-start justify-between grow">
                                <h1 className="font-bold text-lg">{name}</h1>
                                <div className="flex flex-row  gap-2 w-full">
                                    <div className="px-4 py-1 text-sm font-medium rounded-full text-[#c7dff7] bg-[#12467B]">
                                        {template[0].toUpperCase() + template.slice(1)}
                                    </div>
                                    <div className="px-4 py-1 text-sm font-medium rounded-full text-[#c7dff7] bg-[#12467B]">
                                        {interactionCount === 0
                                            ? 'No taps'
                                            : `${interactionCount} taps`}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </a>
                </ContextMenuTrigger>
                <ContextMenuContent>
                    <ContextMenuItem
                        className="gap-2"
                        onClick={() => {
                            navigator.clipboard.writeText(frameUrl)
                            toast.success('Frame Url copied!')
                        }}
                    >
                        <LinkIcon className="w-4 h-4 ml-1 text-[#9fa3af]" />
                        Copy Frame URL
                    </ContextMenuItem>
                    <ContextMenuItem
                        className="gap-2"
                        onClick={async () => {
                            try {
                                await duplicateFrame(id)
                                toast.success(`${name} has been duplicated successfully`)
                            } catch {
                                toast.error(`Failed to duplicate ${name}`)
                            }
                        }}
                    >
                        <CopyPlusIcon className="w-4 h-4 ml-1 text-[#9fa3af]" />
                        Duplicate
                    </ContextMenuItem>
                    <DialogTrigger asChild={true}>
                        <ContextMenuItem className="gap-2 border-transparent bg-white text-red-500 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white">
                            <DeleteIcon className="w-4 h-4 ml-1" />
                            Delete
                        </ContextMenuItem>
                    </DialogTrigger>
                </ContextMenuContent>
            </ContextMenu>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete {frameUrl}</DialogTitle>
                    <DialogDescription>
                        Warning: Are you absolutely sure? Deleting this frame will remove all of its
                        config and state. This action cannot be undone – proceed with caution.
                    </DialogDescription>
                </DialogHeader>
                <form
                    onSubmit={async (e) => {
                        e.preventDefault()
                        setIsDeletingFrame(true)
                        try {
                            await deleteFrame(id)
                            toast.success('Frame deleted successfully!')
                        } catch (e) {
                            const error = e as Error
                            toast.error(error.message)
                        } finally {
                            setIsDeletingFrame(false)
                            setShowDeleteFrameModal(false)
                        }
                    }}
                >
                    <div className="flex items-center space-x-2">
                        <div className="grid flex-1 gap-2">
                            <label htmlFor="verification" className="block text-sm text-gray-700">
                                To verify, type{' '}
                                <span className="font-semibold dark:text-red-600">{frameUrl}</span>{' '}
                                below
                            </label>
                            <div className="relative mt-1 rounded-md shadow-sm">
                                <BaseInput
                                    type="text"
                                    name="verification"
                                    id="verification"
                                    pattern={frameUrl}
                                    required={true}
                                    autoComplete="off"
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="sm:justify-start mt-4">
                        <Button
                            className="w-full"
                            variant="destructive"
                            type={isDeletingFrame ? undefined : 'submit'}
                        >
                            {isDeletingFrame ? <LoaderIcon className="animate-spin" /> : 'Confirm'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

// function DeleteFrameModal(frameId: string) {
//     return (
//         <Dialog>
//             <DialogTrigger asChild>
//                 <Button variant="outline">Share</Button>
//             </DialogTrigger>
//             <DialogContent className="sm:max-w-md">
//                 <DialogHeader>
//                     <DialogTitle>Share link</DialogTitle>
//                     <DialogDescription>
//                         Anyone who has this link will be able to view this.
//                     </DialogDescription>
//                 </DialogHeader>
//                 <div className="flex items-center space-x-2">
//                     <div className="grid flex-1 gap-2">
//                         <Label htmlFor="link" className="sr-only">
//                             Link
//                         </Label>
//                         <Input
//                             id="link"
//                             defaultValue="https://ui.shadcn.com/docs/installation"
//                             readOnly
//                         />
//                     </div>
//                     <Button type="submit" size="sm" className="px-3">
//                         <span className="sr-only">Copy</span>
//                         <Copy className="h-4 w-4" />
//                     </Button>
//                 </div>
//                 <DialogFooter className="sm:justify-start">
//                     <DialogClose asChild>
//                         <Button type="button" variant="secondary">
//                             Close
//                         </Button>
//                     </DialogClose>
//                 </DialogFooter>
//             </DialogContent>
//         </Dialog>
//     )
// }
