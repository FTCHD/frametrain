'use client'
import { Button } from '@/components/shadcn/Button'
import { Input } from '@/components/shadcn/Input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/shadcn/Select'
import { ColorPicker } from '@/sdk/components'
import { useFrameConfig, useFrameState } from '@/sdk/hooks'
import { useRef, useState } from 'react'
import type { Config, State, fieldTypes } from '.'

export default function Inspector() {
    const [showModal, setShowModal] = useState(false)
    const state = useFrameState() as State
    const [config, updateConfig] = useFrameConfig<Config>()
    const fields: fieldTypes[] = config.fields

    const itemNameInputRef = useRef<HTMLInputElement>(null)
    const itemDescriptionInputRef = useRef<HTMLInputElement>(null)
    const itemExampleInputRef = useRef<HTMLInputElement>(null)
    const itemRequiredInputRef = useRef<HTMLInputElement>(null)
    const itemTypeInputRef = useRef<HTMLSelectElement>(null)

    return (
        <div className="w-full h-full space-y-4">
            <div className="w-full">
                <Button
                    className="bg-rose-500 hover:bg-rose-700 text-white py-3 mr-1 rounded"
                    type="button"
                    // onClick={() => state.data && state.data.length !== 0 ? setShowModal(true) : null}
                    onClick={() => setShowModal(true)}
                >
                    Show Submissions
                </Button>
                <Modal showModal={showModal} setShowModal={setShowModal} state={state} />

                <Button
                    onClick={() => {
                        downloadCSV(state, 'form-results.csv')
                    }}
                    className="bg-teal-700 hover:bg-teal-900 text-white py-3 rounded"
                >
                    Download as .CSV
                </Button>

                {/* {!state.data ? (
                    <p className="italic mt-1 text-s">No Form Has Been Submitted Yet!</p>
                ) : null} */}
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
                                Duplicate Submissions
                            </p>
                            <p className="block font-sans text-sm antialiased font-normal leading-normal text-gray-500">
                                If checked, users can submit the form more than once.
                            </p>
                        </div>
                    </label>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-semibold">Form Fields</h2>

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
                            itemTypeInputRef.current!.value = e
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
                                fieldType: itemTypeInputRef.current?.value,
                            },
                        ]
                        updateConfig({
                            fields: newFields,
                        })
                        itemNameInputRef.current.value = ''
                        if (!itemExampleInputRef.current?.value) return
                        if (!itemDescriptionInputRef.current) return
                        itemDescriptionInputRef.current.value = ''
                        itemExampleInputRef.current.value = ''
                    }}
                    className="w-full bg-border hover:bg-secondary-border text-primary"
                >
                    Add Input Field
                </Button>
            </div>

            <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-semibold">Manage Fields</h2>
                {config.fields?.length == 0 ? (
                    <p className="italic text-gray-300">No Input Field Added yet!</p>
                ) : (
                    ''
                )}
                <div className="w-full">
                    <ol className="list-decimal list-inside">
                        {config.fields?.map((field, index) => (
                            <li
                                key={index}
                                className="flex items-center justify-between bg-slate-50 bg-opacity-10 p-2 rounded"
                            >
                                <span>
                                    {index + 1}. {field.fieldName}
                                </span>
                                <button
                                    type="button"
                                    className="text-gray-900 bg-gray-100  border-red-500 hover:bg-red-500 hover:text-white py-1 px-2 rounded italic font-normal"
                                    onClick={() =>
                                        updateConfig({
                                            fields: [
                                                ...fields.slice(0, index),
                                                ...fields.slice(index + 1),
                                            ],
                                        })
                                    }
                                >
                                    Delete
                                </button>
                            </li>
                        ))}
                    </ol>
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

                <h2 className="text-lg font-semibold">Frame's URL</h2>
                <div className="flex flex-col gap-2">
                    <Input
                        className="text-lg border rounded p-2"
                        placeholder="Tap on &quot;URL&quot; on the top right and paste here"
                        defaultValue={config.frameURL}
                        onChange={(e) => {
                            updateConfig({
                                frameURL: e.target.value || undefined,
                            })
                        }}
                    />
                </div>
            </div>
        </div>
    )
}

function generateCSV(state: State): string {
    // Column names
    const columnNames = ['timestamp', 'fid', ...state.inputNames]

    // Rows
    const rows = state.data.map((record) => [record.timestamp, record.fid, ...record.inputValues])

    // Combine column names and rows into CSV string
    const csvContent = [
        columnNames.join(','), // Header row
        ...rows.map((row) => row.join(',')), // Data rows
    ].join('\n')

    return csvContent
}

function downloadCSV(state: State, fileName: string): void {
    const csvContent = generateCSV(state)
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

function generateTable(state: State) {
    return (
        <table className="min-w-full bg-white">
            <thead>
                <tr>
                    <th className="py-2 px-4 border-b-2 border-gray-200 bg-gray-100">Timestamp</th>
                    <th className="py-2 px-4 border-b-2 border-gray-200 bg-gray-100">FID</th>
                    {state.inputNames.map((name, index) => (
                        <th
                            key={index}
                            className="py-2 px-4 border-b-2 border-gray-200 bg-gray-100"
                        >
                            {name}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {state.data.map((record, rowIndex) => (
                    <tr key={rowIndex}>
                        <td className="py-2 px-4 border-b border-gray-200">{record.timestamp}</td>
                        <td className="py-2 px-4 border-b border-gray-200">{record.fid}</td>
                        {record.inputValues.map((value, colIndex) => (
                            <td key={colIndex} className="py-2 px-4 border-b border-gray-200">
                                {value}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    )
}

const Modal = ({
    showModal,
    setShowModal,
    state,
}: { showModal: boolean; setShowModal: any; state: State }) => {
    if (showModal) {
        return (
            <>
                <div className="text-black fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
                    <div className="relative w-auto max-w-3xl mx-auto my-6">
                        {/*content*/}
                        <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                            {/*header*/}
                            <div className="flex items-start justify-between p-5 border-b border-solid border-gray-300 rounded-t">
                                <h3 className="text-3xl font-semibold">Submissions</h3>
                                <button
                                    type="button"
                                    className="p-1 ml-auto bg-transparent border-0 text-black float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                                    onClick={() => setShowModal(false)}
                                >
                                    <span className="bg-transparent text-black h-6 w-6 text-2xl block outline-none focus:outline-none">
                                        ×
                                    </span>
                                </button>
                            </div>
                            {/*body*/}
                            <div className="relative p-6 flex-auto">
                                {!state.data ? (
                                    <p className="italic mt-1 text-s">
                                        No Form Has Been Submitted Yet!
                                    </p>
                                ) : (
                                    generateTable(state)
                                )}
                            </div>
                            {/*footer*/}
                            <div className="flex items-center justify-end p-6 border-t border-solid border-gray-300 rounded-b">
                                <button
                                    className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
                <div className="fixed inset-0 z-40 bg-black opacity-25"></div>
            </>
        )
    }

    return undefined
}
