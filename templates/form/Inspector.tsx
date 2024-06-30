'use client'
import { Button } from '@/components/shadcn/Button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/shadcn/Dialog'
import { Input } from '@/components/shadcn/Input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/shadcn/Select'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/shadcn/Table'
  
import { ColorPicker } from '@/sdk/components'
import { useFrameConfig, useFrameId, useFrameState } from '@/sdk/hooks'
import { useEffect, useRef, useState } from 'react'
import { Trash } from 'react-feather'
import toast from 'react-hot-toast'
import type { Config, State, fieldTypes } from '.'

export default function Inspector() {
    const frameId = useFrameId()
    const state = useFrameState() as State
    const [config, updateConfig] = useFrameConfig<Config>()

    const [showModal, setShowModal] = useState(false)
    const fields: fieldTypes[] = config.fields

    const itemNameInputRef = useRef<HTMLInputElement>(null)
    const itemDescriptionInputRef = useRef<HTMLInputElement>(null)
    const itemExampleInputRef = useRef<HTMLInputElement>(null)
    const itemRequiredInputRef = useRef<HTMLInputElement>(null)
    const [itemType, setItemType] = useState<string>('text')

    useEffect(() => {
        if (!config?.frameId || config.frameId === '') {
            updateConfig({ frameId: frameId })
        }
    }, [updateConfig, config.frameId, frameId])

    return (
        <div className="w-full h-full space-y-4">
            <div className="w-full flex flex-row gap-2">
                <Dialog>
                    <DialogTrigger asChild={true}>
                        <Button>Show Submissions</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Form Submissions</DialogTitle>
                            {/* <DialogDescription>{JSON.stringify(state)}</DialogDescription> */}
                            <DialogDescription>
                                <Table>
                                    <TableCaption>
                                        {state.data?.length || 0} Submission(s)
                                    </TableCaption>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[100px]">Timestamp</TableHead>
                                            <TableHead className="w-[100px]">FID</TableHead>
                                            {[
                                                ...config.fields.map(
                                                    (field) => field.fieldName ?? ''
                                                ),
                                            ].map((name, index) => (
                                                <TableHead key={index} className="w-[100px]">
                                                    {name}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {state.data?.map((record, rowIndex) => (
                                            <TableRow key={rowIndex}>
                                                <TableCell className="font-medium">
                                                    {record.timestamp}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {record.fid}
                                                </TableCell>
                                                {record.inputValues.map((value, colIndex) => (
                                                    <TableCell
                                                        key={colIndex}
                                                        className="font-medium"
                                                    >
                                                        {value}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </DialogDescription>
                        </DialogHeader>
                    </DialogContent>
                </Dialog>

                <Button
                    onClick={() => {
                        if (!state.data?.length) {
                            toast.error('No data to download')
                            return
                        }
                        downloadCSV(state, 'form-results.csv', [
                            ...config.fields.map((field) => field.fieldName ?? ''),
                        ])
                    }}
                >
                    Download CSV
                </Button>
            </div>

            <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-semibold">Messages</h2>

                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-semibold">Form Title</h2>
                    <Input
                        className="text-lg mb-1"
                        placeholder="Text for the Cover"
                        defaultValue={config.coverText}
                        onChange={(e) => {
                            updateConfig({
                                coverText: e.target.value || undefined,
                            })
                        }}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-semibold">About Text</h2>
                    <Input
                        className="text-lg mb-1"
                        placeholder="Text for the About section"
                        defaultValue={config.aboutText}
                        onChange={(e) => {
                            updateConfig({
                                aboutText: e.target.value || undefined,
                            })
                        }}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-semibold">Success Message</h2>
                    <Input
                        className="text-lg mb-1"
                        placeholder="Appears after entry is successfully submitted"
                        defaultValue={config.successText}
                        onChange={(e) => {
                            updateConfig({
                                successText: e.target.value || undefined,
                            })
                        }}
                    />
                </div>
                <div className="inline-flex items-center">
                    <label
                        className="relative flex items-center p-3 -mt-3 rounded-full cursor-pointer"
                        htmlFor="allowDuplicates"
                    >
                        <input
                            type="checkbox"
                            id="allowDuplicates"
                            defaultChecked={config.allowDuplicates}
                            onChange={(e) => {
                                updateConfig({
                                    allowDuplicates: e.target.checked,
                                })
                            }}
                        />
                    </label>
                    <label
                        className="font-light text-gray-500 cursor-pointer select-none"
                        htmlFor="allowDuplicates"
                    >
                        <div>
                            <p className="block font-sans text-base antialiased font-medium leading-relaxed text-gray-200">
                                Multiple Submissions
                            </p>
                            <p className="block font-sans text-sm antialiased font-normal leading-normal text-gray-500">
                                If checked, users can submit the form more than once.
                            </p>
                        </div>
                    </label>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-semibold">New Field</h2>

                <div className="flex flex-row gap-2">
                    <div className="flex flex-col w-full gap-2">
                        <label
                            className="block uppercase tracking-wide text-gray-200 text-xs font-bold mb-2"
                            htmlFor="grid-inp-name"
                        >
                            Input Name
                        </label>
                        <Input
                            className="text-lg"
                            id="grid-inp-name"
                            placeholder="Drink"
                            ref={itemNameInputRef}
                        />
                    </div>
                    <div className="flex flex-col w-full gap-2">
                        <label
                            className="block uppercase tracking-wide text-gray-200 text-xs font-bold mb-2"
                            htmlFor="grid-example"
                        >
                            Example Input
                        </label>
                        <Input
                            className="text-lg"
                            id="grid-example"
                            placeholder="Lemonade"
                            ref={itemExampleInputRef}
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label
                        className="block uppercase tracking-wide text-gray-200 text-xs font-bold mb-2"
                        htmlFor="grid-desc"
                    >
                        Input Description
                    </label>
                    <Input
                        className="text-lg"
                        placeholder="What is your favorite drink?"
                        ref={itemDescriptionInputRef}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label
                        htmlFor="dropdown"
                        className="block uppercase tracking-wide text-gray-200 text-xs font-bold"
                    >
                        Data Type
                    </label>
                    <Select
                        onValueChange={(e) => {
                            setItemType(e)
                        }}
                        defaultValue={'text'}
                    >
                        <SelectTrigger className="w-full h-12">
                            <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="phone">Phone</SelectItem>
                            <SelectItem value="address">Address</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="w-full">
                    <div className="inline-flex items-center">
                        <label
                            className="relative flex items-center p-3 rounded-full cursor-pointer"
                            htmlFor="req-desc"
                        >
                            <input type="checkbox" ref={itemRequiredInputRef} id="req-desc" />
                        </label>
                        <label
                            className="mt-px font-light text-gray-500 cursor-pointer select-none"
                            htmlFor="req-desc"
                        >
                            <div>
                                <p className="block font-sans text-base antialiased font-medium leading-relaxed text-gray-200">
                                    Required
                                </p>
                                <p className="block font-sans text-sm antialiased font-normal leading-normal text-gray-500">
                                    If checked, user must fill in a value for the input field.
                                </p>
                            </div>
                        </label>
                    </div>
                </div>

                <Button
                    type="button"
                    onClick={() => {
                        if (!itemNameInputRef.current?.value) return

                        const newFields = [
                            ...(fields || []),
                            {
                                fieldName: itemNameInputRef.current.value,
                                fieldDescription: itemDescriptionInputRef.current?.value ?? '',
                                fieldExample: itemExampleInputRef.current?.value ?? '',
                                required: itemRequiredInputRef.current?.checked,
                                fieldType: itemType,
                            },
                        ]
                        updateConfig({
                            fields: newFields,
                        })
                        itemNameInputRef.current.value = ''
                        setItemType('text')
                        itemRequiredInputRef.current!.checked = false
                        if (!itemExampleInputRef.current?.value) return
                        if (!itemDescriptionInputRef.current) return
                        itemDescriptionInputRef.current.value = ''
                        itemExampleInputRef.current.value = ''
                    }}
                    className="w-full bg-border hover:bg-secondary-border text-primary"
                >
                    ADD FIELD
                </Button>
            </div>

            <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-semibold">Manage Fields</h2>
                {config.fields?.length == 0 ? (
                    <p className="italic text-gray-300">No Input Field Added yet!</p>
                ) : undefined}
                <div className="w-full flex flex-col gap-2">
                    {config.fields?.map((field, index) => (
                        <div
                            key={index}
                            className="flex flex-row items-center justify-between bg-slate-50 bg-opacity-10 p-2 rounded"
                        >
                            <span>
                                {index + 1}. {field.fieldName}
                            </span>
                            <Button
                                variant={'destructive'}
                                onClick={() =>
                                    updateConfig({
                                        fields: [
                                            ...fields.slice(0, index),
                                            ...fields.slice(index + 1),
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

            <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-semibold">Customization</h2>
                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-semibold">Background Color</h2>
                    <ColorPicker
                        className="w-full"
                        enabledPickers={['solid', 'gradient']}
                        background={
                            config.backgroundColor ||
                            'linear-gradient(to right, #0f0c29, #0b6bcb, #0f0c29)'
                        }
                        setBackground={(value) => updateConfig({ backgroundColor: value })}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-semibold">Text Color</h2>
                    <ColorPicker
                        className="w-full"
                        background={config.fontColor || '#FFFFFF'}
                        setBackground={(value) => updateConfig({ fontColor: value })}
                    />
                </div>

                <h2 className="text-lg font-semibold">Share Message</h2>
                <div className="flex flex-col gap-2">
                    <Input
                        className="text-lg border rounded p-2"
                        placeholder="Appears as the cast message when sharing"
                        defaultValue={config.shareText}
                        onChange={(e) => {
                            updateConfig({
                                shareText: e.target.value || undefined,
                            })
                        }}
                    />
                </div>
            </div>
        </div>
    )
}

function downloadCSV(state: State, fileName: string, inputNames: string[]): void {
    // Column names
    const columnNames = ['timestamp', 'fid', inputNames]

    // Rows
    const rows = state.data.map((record) => [record.timestamp, record.fid, ...record.inputValues])

    // Combine column names and rows into CSV string
    const csvContent = [
        columnNames.join(','), // Header row
        ...rows.map((row) => row.join(',')), // Data rows
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', fileName)
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

