'use client'

import { useFarcasterId, useFarcasterName, useFrameConfig, useFrameStorage } from '@/sdk/hooks'
import { useEffect } from 'react'
import toast from 'react-hot-toast'
import type { Config, Storage, fieldTypes } from '..'

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
import { Label } from '@/components/shadcn/Label'
import { Switch } from '@/components/shadcn/Switch'
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
import GatingOptions from '@/sdk/components/GatingOptions'
import { humanizeTimestamp } from '../utils'
import FormFieldEditor from './FormFieldEditor'

function downloadCSV(storage: Storage, fileName: string, inputNames: string[]): void {
    // Column names
    const columnNames = ['Date', 'fid', ...inputNames]

    // Rows
    const rows = storage.data.map((record) => [
        humanizeTimestamp(record.timestamp),
        record.fid,
        ...record.values.filter((v) => inputNames.includes(v.field)).map((v) => v.value),
    ])
    const array = rows.map((row) => {
        return columnNames.reduce(
            (acc, colName, index) => {
                acc[colName] = row[index]
                return acc
            },
            {} as Record<string, unknown>
        )
    })

    // Combine column names and rows into CSV string
    const csvContent = [
        columnNames.join(','),
        ...array.map((obj) =>
            columnNames.reduce(
                (acc, key) => `${acc}${!acc.length ? '' : ','}"${!obj[key] ? '' : obj[key]}"`,
                ''
            )
        ),
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

export default function FormEditor({ isEditing = false }: { isEditing?: boolean }) {
    const storage = useFrameStorage() as Storage
    const [config, updateConfig] = useFrameConfig<Config>()
    const fid = useFarcasterId()
    const username = useFarcasterName()

    const enabledGating = config.enableGating ?? false

    const fields: fieldTypes[] = config.fields || []

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        if (!config?.owner) {
            updateConfig({
                owner: {
                    username,
                    fid,
                },
            })
        }
    }, [])

    return (
        <div>
            <div className="w-full flex flex-row gap-2">
                <Dialog>
                    <DialogTrigger asChild={true}>
                        <Button>Show Submissions</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Form Submissions</DialogTitle>
                            {/* <DialogDescription>{JSON.stringify(storage)}</DialogDescription> */}
                            <DialogDescription>
                                <Table>
                                    <TableCaption>
                                        {storage.data?.length || 0} Submission(s)
                                    </TableCaption>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[100px]">Date</TableHead>
                                            <TableHead className="w-[100px]">FID</TableHead>
                                            {[...config.fields.map((field) => field.fieldName)].map(
                                                (name, index) => (
                                                    <TableHead key={index} className="w-[100px]">
                                                        {name}
                                                    </TableHead>
                                                )
                                            )}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {storage.data?.map((record, rowIndex) => (
                                            <TableRow key={rowIndex}>
                                                <TableCell className="font-medium">
                                                    {humanizeTimestamp(record.timestamp)}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {record.fid}
                                                </TableCell>
                                                {record.values
                                                    .filter((v) =>
                                                        config.fields.some(
                                                            (f) => f.fieldName === v.field
                                                        )
                                                    )
                                                    .map((v, colIndex) => (
                                                        <TableCell
                                                            key={colIndex}
                                                            className="font-medium"
                                                        >
                                                            {v.value}
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
                        if (!storage.data?.length) {
                            toast.error('No data to download')
                            return
                        }

                        downloadCSV(storage, 'form-results.csv', [
                            ...config.fields.map((field) => field.fieldName),
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
                <FormFieldEditor
                    isEditing={isEditing}
                    onUpdateField={(field) => {
                        const newFields = [...fields, field]
                        updateConfig({
                            fields: newFields,
                        })
                    }}
                />
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

            <div className="flex flex-row items-center justify-between gap-2 ">
                <Label className="font-md" htmlFor="gating">
                    Enable Form Gating?
                </Label>
                <Switch
                    id="gating"
                    checked={enabledGating}
                    onCheckedChange={(enableGating) => {
                        if (enableGating && !config.owner) {
                            toast.error(
                                'Please configure your farcaster username before enabling Poll Gating'
                            )
                            return
                        }
                        updateConfig({ enableGating })
                    }}
                />
            </div>

            {enabledGating && (
                <div className="flex flex-col gap-2 w-full">
                    <h2 className="text-lg font-semibold">Form Gating options</h2>
                    <GatingOptions
                        onUpdate={(option) => {
                            updateConfig({
                                gating: {
                                    ...config.gating,
                                    ...option,
                                },
                            })
                        }}
                        config={config.gating}
                    />
                </div>
            )}
        </div>
    )
}
