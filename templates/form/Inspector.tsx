'use client'
import { Button } from '@/components/shadcn/Button'
import { Input } from '@/components/shadcn/Input'
import { useFrameConfig, useFrameState } from '@/sdk/hooks'
import { useEffect, useRef, useState } from 'react'
import type { Config, fieldTypes, State } from '.'
import { ColorPicker } from '@/sdk/components'

export default function Inspector() {
    const [showModal, setShowModal] = useState(false)
    const state = useFrameState() as State
    const [config, updateConfig] = useFrameConfig<Config>()
    const fields: fieldTypes[] = config.fields

    const shareTextInputRef = useRef<HTMLInputElement>(null)
    const frameURLInputRef = useRef<HTMLInputElement>(null)

    const coverInputRef = useRef<HTMLInputElement>(null)
    const aboutInputRef = useRef<HTMLInputElement>(null)
    const successInputRef = useRef<HTMLInputElement>(null)
    const duplicateInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (coverInputRef.current) {
            coverInputRef.current.value = config.coverText ?? ''
        }
        if (aboutInputRef.current) {
            aboutInputRef.current.value = config.aboutText ?? ''
        }
        if (successInputRef.current) {
            successInputRef.current.value = config.successText ?? ''
        }
        if (duplicateInputRef.current) {
            duplicateInputRef.current.checked = config.allowDuplicates
        }
    }, [config])

    const itemNameInputRef = useRef<HTMLInputElement>(null)
    const itemDescriptionInputRef = useRef<HTMLInputElement>(null)
    const itemExampleInputRef = useRef<HTMLInputElement>(null)
    const itemRequiredInputRef = useRef<HTMLInputElement>(null)
    const itemTypeInputRef = useRef<HTMLSelectElement>(null)

    return (
        <div className="w-full h-full space-y-4">
            <Button
                className="bg-blue-500 hover:bg-blue-700 text-white py-3 mr-1 rounded"
                type="button"
                onClick={() => setShowModal(true)}
            >
                Show Submissions
            </Button>
            <Modal showModal={showModal} setShowModal={setShowModal} state={state} />

            <Button
                onClick={() => {
                    downloadCSV(state, 'form-results.csv')
                }}
                className="bg-blue-500 hover:bg-blue-700 text-white py-3 rounded"
            >
                DOWNLOAD RESULTS
            </Button>
            <p>refresh to download the latest results</p>

            <h2 className="text-lg font-semibold">Poll Title</h2>
            <div className="flex flex-col gap-2">
                <Input
                    className="text-lg border rounded p-2"
                    placeholder="Enter Title"
                    ref={coverInputRef}
                />
            </div>

            <h2 className="text-lg font-semibold">About Text</h2>
            <div className="flex flex-col gap-2">
                <Input
                    className="text-lg border rounded p-2"
                    placeholder="Enter About Text"
                    ref={aboutInputRef}
                />
            </div>

            <h2 className="text-lg font-semibold">Success Message</h2>
            <div className="flex flex-col gap-2">
                <Input
                    className="text-lg border rounded p-2"
                    placeholder="Enter Success Text"
                    ref={successInputRef}
                />
            </div>

            <div className="flex items-center space-x-2">
                <Input
                    id="duplicateAllowed"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    ref={duplicateInputRef}
                />
                <label htmlFor="duplicateAllowed" className="text-lg ml-2">
                    Duplicate Submissions Allowed?
                </label>
            </div>

            <Button
                onClick={() => {
                    if (!coverInputRef.current?.value) return
                    if (!aboutInputRef.current?.value) return
                    if (!successInputRef.current?.value) return
                    if (!duplicateInputRef.current) return

                    updateConfig({
                        coverText: coverInputRef.current.value,
                        aboutText: aboutInputRef.current.value,
                        successText: successInputRef.current.value,
                        allowDuplicates: duplicateInputRef.current?.checked ?? false,
                    })
                }}
                className="w-full bg-blue-500 hover:bg-blue-700 text-white py-2 rounded"
            >
                Save
            </Button>

            <h2 className="text-lg font-semibold">Current Input Fields</h2>
            <ol className="list-decimal list-inside">
                {config.fields?.map((field, index) => (
                    <li
                        key={index}
                        className="flex items-center justify-between bg-slate-50 bg-opacity-50 p-2 rounded mb-1"
                    >
                        <span>
                            {index + 1}. {field.fieldName}
                        </span>
                        <button
                            type="button"
                            className="text-slate-500 bg-gray-200  border-red-500 hover:bg-red-500 hover:text-white font-bold py-1 px-2 rounded"
                            onClick={() =>
                                updateConfig({
                                    fields: [...fields.slice(0, index), ...fields.slice(index + 1)],
                                })
                            }
                        >
                            X
                        </button>
                    </li>
                ))}
            </ol>

            <h2 className="text-lg font-semibold">Add Input Field</h2>
            <div className="flex flex-col gap-2">
                <Input
                    className="text-lg border rounded p-2"
                    placeholder="Input Field Name"
                    ref={itemNameInputRef}
                />
                <Input
                    className="text-lg border rounded p-2"
                    placeholder="Input Description"
                    ref={itemDescriptionInputRef}
                />
                <Input
                    className="text-lg border rounded p-2"
                    placeholder="An Example Of The Data (Shown to the user)"
                    ref={itemExampleInputRef}
                />
                <div className="flex items-center space-x-2">
                    <Input
                        id="required"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        ref={itemRequiredInputRef}
                    />
                    <label htmlFor="required" className="text-lg ml-2">
                        Required
                    </label>
                </div>

                <div className="flex items-center space-x-2">
                    <label htmlFor="dropdown" className="text-lg">
                        Data Type
                    </label>
                    <select id="dropdown" ref={itemTypeInputRef} className="border rounded p-2">
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="email">Email</option>
                        <option value="phone">Phone</option>
                        <option value="address">Address</option>
                    </select>
                </div>
                <Button
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
                    className="w-full bg-blue-500 hover:bg-blue-700 text-white py-2 rounded"
                >
                    Add Input Field
                </Button>
            </div>

            <Button
                variant="destructive"
                className="w-full bg-red-500 hover:bg-red-700 text-white py-2 rounded"
                onClick={() => updateConfig({ fields: [] })}
            >
                RESET FORM
            </Button>

            <div className="flex flex-col gap-2 ">
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

            <div className="flex flex-col gap-2 ">
                <h2 className="text-lg font-semibold">Text Color</h2>
                <ColorPicker
                    className="w-full"
                    background={config.fontColor || '#FFFFFF'}
                    setBackground={(value) => updateConfig({ fontColor: value })}
                />
            </div>

            <h2 className="text-lg font-semibold">Share Button's Sentence</h2>
            <div className="flex flex-col gap-2">
                <Input
                    className="text-lg border rounded p-2"
                    placeholder="Enter Share Text"
                    ref={shareTextInputRef}
                />
            </div>

            <h2 className="text-lg font-semibold">Frame's URL</h2>
            <div className="flex flex-col gap-2">
                <Input
                    className="text-lg border rounded p-2"
                    placeholder="Click on &quot;URL&quot; from top right and paste here"
                    ref={frameURLInputRef}
                />
            </div>

            <Button
                onClick={() => {
                    if (!shareTextInputRef.current?.value) return
                    if (!frameURLInputRef.current?.value) return

                    updateConfig({
                        shareText: shareTextInputRef.current.value,
                        frameURL: frameURLInputRef.current.value,
                    })
                }}
                className="w-full bg-blue-500 hover:bg-blue-700 text-white py-2 rounded"
            >
                Save
            </Button>
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
    return (
        <>
            {showModal ? (
                <>
                    <div className="text-black fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
                        <div className="relative w-auto max-w-3xl mx-auto my-6">
                            {/*content*/}
                            <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                                {/*header*/}
                                <div className="flex items-start justify-between p-5 border-b border-solid border-gray-300 rounded-t">
                                    <h3 className="text-3xl font-semibold">State Data Table</h3>
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
                                <div className="relative p-6 flex-auto">{generateTable(state)}</div>
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
            ) : null}
        </>
    )
}
