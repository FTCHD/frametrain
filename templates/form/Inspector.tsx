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
    console.log(config)

    return (
        <div className="w-full h-full space-y-4">
            <div className="w-full px-6">
                <Button
                    className="bg-rose-500 hover:bg-rose-700 text-white py-3 mr-1 rounded"
                    type="button"
                    onClick={() => state.data && state.data.length !== 0 ? setShowModal(true) : null}
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
                
                {!state.data ? (<p className="italic mt-1 text-s">No Form Has Been Submitted Yet!</p>): null}

                <p className="italic mt-1">* refresh to download the latest results</p>
                
            </div>

            <div className="w-full">
                <h2 className="text-2xl font-bold">Template Texts</h2>
                <form className="w-full px-6">
                    <div className="flex items-center border-b border-teal-500 py-2">
                        <input
                            className="appearance-none bg-transparent border-none w-full text-slate-50 mr-3 py-1 px-2 leading-tight focus:outline-none"
                            type="text"
                            placeholder="Form Title (Text For The Cover)"
                            aria-label="Title"
                            ref={coverInputRef}
                        />
                        <button
                            className="flex-shrink-0 bg-teal-500 hover:bg-teal-700 border-teal-500 hover:border-teal-700 text-sm border-4 text-white py-1 px-2 rounded"
                            type="button"
                            onClick={() => {
                                if (!coverInputRef.current?.value) return
                                updateConfig({
                                    coverText: coverInputRef.current.value,
                                })
                            }}
                        >
                            Save
                        </button>
                    </div>
                    <div className="flex items-center border-b border-teal-500 py-2">
                        <input
                            className="appearance-none bg-transparent border-none w-full text-slate-50 mr-3 py-1 px-2 leading-tight focus:outline-none"
                            type="text"
                            placeholder="About Text (Text For The About Section)"
                            aria-label="About"
                            ref={aboutInputRef}
                        />
                        <button
                            className="flex-shrink-0 bg-teal-500 hover:bg-teal-700 border-teal-500 hover:border-teal-700 text-sm border-4 text-white py-1 px-2 rounded"
                            type="button"
                            onClick={() => {
                                if (!aboutInputRef.current?.value) return
                                updateConfig({
                                    aboutText: aboutInputRef.current.value,
                                    // successText: successInputRef.current.value,
                                    // allowDuplicates: duplicateInputRef.current?.checked ?? false,
                                })
                            }}
                        >
                            Save
                        </button>
                    </div>
                    <div className="flex items-center border-b border-teal-500 py-2">
                        <input
                            className="appearance-none bg-transparent border-none w-full text-slate-50 mr-3 py-1 px-2 leading-tight focus:outline-none"
                            type="text"
                            placeholder="Success Message (After Entry Successfully Submitted)"
                            aria-label="Success Message"
                            ref={successInputRef}
                        />
                        <button
                            className="flex-shrink-0 bg-teal-500 hover:bg-teal-700 border-teal-500 hover:border-teal-700 text-sm border-4 text-white py-1 px-2 rounded"
                            type="button"
                            onClick={() => {
                                if (!successInputRef.current?.value) return
                                updateConfig({
                                    successText: successInputRef.current.value,
                                    // allowDuplicates: duplicateInputRef.current?.checked ?? false,
                                })
                            }}
                        >
                            Save
                        </button>
                    </div>
                    <div className="mt-6 inline-flex items-center">
                        <label
                            className="relative flex items-center p-3 -mt-3 rounded-full cursor-pointer"
                            htmlFor="description"
                        >
                            <input
                                type="checkbox"
                                className="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-md border border-blue-gray-200 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-gray-900 checked:bg-gray-900 checked:before:bg-gray-900 hover:before:opacity-10"
                                id="description"
                                ref={duplicateInputRef}
                                onChange={() => {
                                    updateConfig({
                                        allowDuplicates:
                                            duplicateInputRef.current?.checked ?? false,
                                    })
                                }}
                            />
                            <span className="absolute text-white transition-opacity opacity-0 pointer-events-none top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-3.5 w-3.5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    stroke="currentColor"
                                    strokeWidth={1}
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </span>
                        </label>
                        <label
                            className="mt-px font-light text-gray-500 cursor-pointer select-none"
                            htmlFor="description"
                        >
                            <div>
                                <p className="block font-sans text-base antialiased font-medium leading-relaxed text-gray-200">
                                    Duplicate Submissions
                                </p>
                                <p className="block font-sans text-sm antialiased font-normal leading-normal text-gray-500">
                                    If checked, multiple Fids can submit the form more than once.
                                </p>
                            </div>
                        </label>
                    </div>
                </form>
            </div>

            <div className="w-full border-y-2 border-gray-500 py-2">
                <div className="w-full">
                    <h2 className="text-lg font-bold mb-3">Add Input Fields</h2>
                    <form className="w-full px-6">
                        <div className="flex flex-wrap -mx-3 mb-4">
                            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                                <label
                                    className="block uppercase tracking-wide text-gray-200 text-xs font-bold mb-2"
                                    htmlFor="grid-first-name"
                                >
                                    Input Name
                                </label>
                                <input
                                    className="appearance-none block w-full bg-gray-200 text-gray-800 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    id="grid-first-name"
                                    type="text"
                                    placeholder="Drink"
                                    ref={itemNameInputRef}
                                />
                            </div>
                            <div className="w-full md:w-1/2 px-3">
                                <label
                                    className="block uppercase tracking-wide text-gray-200 text-xs font-bold mb-2"
                                    htmlFor="grid-last-name"
                                >
                                    Example Input
                                </label>
                                <input
                                    className="appearance-none block w-full bg-gray-200 text-gray-800 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    id="grid-last-name"
                                    type="text"
                                    placeholder="Lemonade"
                                    ref={itemExampleInputRef}
                                />
                            </div>
                        </div>
                        <div className="flex flex-wrap -mx-3">
                            <div className="w-full md:w-2/3 px-3">
                                <label
                                    className="block uppercase tracking-wide text-gray-200 text-xs font-bold mb-2"
                                    htmlFor="grid-desc"
                                >
                                    Input Description
                                </label>
                                <input
                                    className="appearance-none block w-full bg-gray-200 text-gray-800 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    id="grid-desc"
                                    type="text"
                                    placeholder="What is your favorite drink?"
                                    ref={itemDescriptionInputRef}
                                />
                                {/* <p className="text-gray-600 text-xs italic">
                            Make it as long and as crazy as you'd like
                        </p> */}
                            </div>
                            <div className="w-full md:w-1/3 px-3">
                                <label
                                    htmlFor="dropdown"
                                    className="block uppercase tracking-wide text-gray-200 text-xs font-bold mb-2"
                                >
                                    Data Type
                                </label>
                                <select
                                    id="dropdown"
                                    ref={itemTypeInputRef}
                                    className="border rounded p-2"
                                >
                                    <option value="text">Text</option>
                                    <option value="number">Number</option>
                                    <option value="email">Email</option>
                                    <option value="phone">Phone</option>
                                    <option value="address">Address</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex flex-wrap -mx-6 mb-6">
                            <div className="w-full px-3">
                                <div className="inline-flex items-center">
                                    <label
                                        className="relative flex items-center p-3 -mt-3 rounded-full cursor-pointer"
                                        htmlFor="req-desc"
                                    >
                                        <input
                                            type="checkbox"
                                            className="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-md border border-blue-gray-200 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-gray-900 checked:bg-gray-900 checked:before:bg-gray-900 hover:before:opacity-10"
                                            id="req-desc"
                                            ref={itemRequiredInputRef}
                                        />
                                        <span className="absolute text-white transition-opacity opacity-0 pointer-events-none top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-3.5 w-3.5"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                                stroke="currentColor"
                                                strokeWidth={1}
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </span>
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
                                                If checked, user must fill in a value for the input
                                                field.
                                            </p>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-wrap -mx-6 mb-6">
                            <div className="w-full px-3">
                                <Button
                                    type="button"
                                    onClick={() => {
                                        if (!itemNameInputRef.current?.value) return

                                        const newFields = [
                                            ...(fields || []),
                                            {
                                                fieldName: itemNameInputRef.current.value,
                                                fieldDescription:
                                                    itemDescriptionInputRef.current?.value ?? '',
                                                fieldExample:
                                                    itemExampleInputRef.current?.value ?? '',
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
                        </div>
                    </form>
                </div>

                <div className="w-full mb-3">
                    <h2 className="text-lg font-bold mb-3">Current Input Fields</h2>
                    {config.fields?.length == 0 ? (
                        <p className="italic mt-1 px-3 text-gray-300">No Input Field Added yet!</p>
                    ) : (
                        ''
                    )}
                    <div className="w-full px-12">
                        <ol className="list-decimal list-inside">
                            {config.fields?.map((field, index) => (
                                <li
                                    key={index}
                                    className="flex items-center justify-between bg-slate-50 bg-opacity-10 p-2 rounded mb-1"
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
                                        delete
                                    </button>
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
            </div>

            {/* <div className="w-full">
                <h2 className="text-lg font-bold mb-3">Add Input Field</h2>
                <div className="w-full px-6">
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
                            <select
                                id="dropdown"
                                ref={itemTypeInputRef}
                                className="border rounded p-2"
                            >
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
                                        fieldDescription:
                                            itemDescriptionInputRef.current?.value ?? '',
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
                </div>
            </div> */}

            {/* <Button
                variant="destructive"
                className="w-full bg-red-500 hover:bg-red-700 text-white py-2 rounded"
                onClick={() => updateConfig({ fields: [] })}
            >
                RESET FORM
            </Button> */}

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
