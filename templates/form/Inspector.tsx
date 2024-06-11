'use client'
import { Button } from '@/components/shadcn/Button'
import { Input } from '@/components/shadcn/Input'
import { useFrameConfig, useFrameState } from '@/sdk/hooks'
import { useEffect, useRef } from 'react'
import type { Config, fieldTypes, State } from '.'
import { ColorPicker } from '@/sdk/components'

export default function Inspector() {
    const state = useFrameState() as State
    const [config, updateConfig] = useFrameConfig<Config>()
    const fields: fieldTypes[] = config.fields

    const coverInputRef = useRef<HTMLInputElement>(null)
    const aboutInputRef = useRef<HTMLInputElement>(null)
    const successInputRef = useRef<HTMLInputElement>(null)

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
    }, [config])

    const itemNameInputRef = useRef<HTMLInputElement>(null)
    const itemDescriptionInputRef = useRef<HTMLInputElement>(null)
    const itemExampleInputRef = useRef<HTMLInputElement>(null)
    const itemRequiredInputRef = useRef<HTMLInputElement>(null)
    const itemTypeInputRef = useRef<HTMLSelectElement>(null)

    return (
        <div className="w-full h-full space-y-4">
            <Button
                onClick={() => {
                    downloadCSV(state, 'form-results.csv')
                }}
                className="w-full bg-blue-500 hover:bg-blue-700 text-white py-2 rounded"
            >
                DOWNLOAD RESULTS
            </Button>
            <p>{JSON.stringify(config)}</p>

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

            <Button
                onClick={() => {
                    if (!coverInputRef.current?.value) return
                    if (!aboutInputRef.current?.value) return
                    if (!successInputRef.current?.value) return

                    updateConfig({
                        coverText: coverInputRef.current.value,
                        aboutText: aboutInputRef.current.value,
                        successText: successInputRef.current.value,
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

// Usage example
// downloadCSV(state, 'data.csv');
