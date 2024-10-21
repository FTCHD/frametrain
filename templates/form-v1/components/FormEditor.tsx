'use client'
import { Button, ColorPicker, Input, Modal, Table } from '@/sdk/components'
import { useFrameConfig, useFrameStorage } from '@/sdk/hooks'
import toast from 'react-hot-toast'
import type { Config, Storage, fieldTypes } from '..'
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
    const [storage] = useFrameStorage<Storage>()
    const [config, updateConfig] = useFrameConfig<Config>()

    const fields: fieldTypes[] = config.fields || []

    return (
        <>
            <div className="flex flex-col gap-4">
                <div className="w-full flex flex-row gap-2">
                    <Modal.Root>
                        <Modal.Trigger asChild={true}>
                            <Button>Show Submissions</Button>
                        </Modal.Trigger>
                        <Modal.Content>
                            <Modal.Header>
                                <Modal.Title>Form Submissions</Modal.Title>
                                {/* <Modal.Description>{JSON.stringify(storage)}</Modal.Description> */}
                                <Modal.Description>
                                    <Table.Root>
                                        <Table.Caption>
                                            {storage.data?.length || 0} Submission(s)
                                        </Table.Caption>
                                        <Table.Header>
                                            <Table.Row>
                                                <Table.Head className="w-[100px]">Date</Table.Head>
                                                <Table.Head className="w-[100px]">FID</Table.Head>
                                                {[
                                                    ...config.fields.map(
                                                        (field) => field.fieldName
                                                    ),
                                                ].map((name, index) => (
                                                    <Table.Head key={index} className="w-[100px]">
                                                        {name}
                                                    </Table.Head>
                                                ))}
                                            </Table.Row>
                                        </Table.Header>
                                        <Table.Body>
                                            {storage.data?.map((record, rowIndex) => (
                                                <Table.Row key={rowIndex}>
                                                    <Table.Cell className="font-medium">
                                                        {humanizeTimestamp(record.timestamp)}
                                                    </Table.Cell>
                                                    <Table.Cell className="font-medium">
                                                        {record.fid}
                                                    </Table.Cell>
                                                    {record.values
                                                        .filter((v) =>
                                                            config.fields.some(
                                                                (f) => f.fieldName === v.field
                                                            )
                                                        )
                                                        .map((v, colIndex) => (
                                                            <Table.Cell
                                                                key={colIndex}
                                                                className="font-medium"
                                                            >
                                                                {v.value}
                                                            </Table.Cell>
                                                        ))}
                                                </Table.Row>
                                            ))}
                                        </Table.Body>
                                    </Table.Root>
                                </Modal.Description>
                            </Modal.Header>
                        </Modal.Content>
                    </Modal.Root>

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
                </div>
            </div>
        </>
    )
}
