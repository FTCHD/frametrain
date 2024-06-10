'use client'
import { Button } from '@/components/shadcn/Button'
import { Input } from '@/components/shadcn/Input'
import { useFrameConfig, useFrameId } from '@/sdk/hooks'
import { useRef } from 'react'
import type { Config, fieldTypes } from '.'

export default function Inspector() {
    const [config, updateConfig] = useFrameConfig<Config>()
    // const frameId = useFrameId()
    const fields: fieldTypes[] = config.fields;


    const itemNameInputRef = useRef<HTMLInputElement>(null)
    const itemDescriptionInputRef = useRef<HTMLInputElement>(null)
    const itemExampleInputRef = useRef<HTMLInputElement>(null)
    const itemIsNecessaryInputRef = useRef<HTMLInputElement>(null)
    const itemTypeInputRef = useRef<HTMLSelectElement>(null)

    return (
        <div className="w-full h-full space-y-4">
            <p>{JSON.stringify(config)}</p>
            <h2 className="text-lg font-semibold">Current Input Fields</h2>
            <ol className="list-decimal list-inside">
                {config.fields?.map((field, index) => (
                    <li key={index} className="flex items-center justify-between bg-slate-50 bg-opacity-50 p-2 rounded mb-1">
                        <span>{index + 1}. {field.fieldName}</span>
                        <button
                            className="text-slate-500 bg-gray-200  border-red-500 hover:bg-red-500 hover:text-white font-bold py-1 px-2 rounded"
                            onClick={() => updateConfig({ fields: [...fields.slice(0, index), ...fields.slice(index + 1)] })}
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
                    <input
                        id="isnecessary"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        ref={itemIsNecessaryInputRef}
                    />
                    <label htmlFor="isnecessary" className="text-lg ml-2">Is Necessary</label>
                </div>

                <div className="flex items-center space-x-2">
                    <label htmlFor="dropdown" className="text-lg">Data Type</label>
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
                                isNecessary: itemIsNecessaryInputRef.current?.checked,
                                fieldType: itemTypeInputRef.current?.value
                            }
                        ]
                        updateConfig({
                            fields: newFields
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
        </div>

    )
}
