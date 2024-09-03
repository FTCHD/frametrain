'use client'
import { Button, Input, Select } from '@/sdk/components'
import { TextSlideStyleConfig } from '@/sdk/components/TextSlideEditor'
import { LoaderIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { fieldTypes } from '..'

export type TextStyleConfigs = {
    background?: string
} & fieldTypes['fieldNameStyle']

type FormFieldEditorProps = {
    formField?: fieldTypes
    isEditing?: boolean
    onUpdateField: (updatedField: fieldTypes) => void
}

export default function FormFieldEditor({
    formField,
    isEditing = false,
    onUpdateField,
}: FormFieldEditorProps) {
    const [fieldType, setFieldType] = useState<fieldTypes['fieldType']>(
        formField?.fieldType || 'text'
    )
    const [nameStyles, setNameStyles] = useState(formField?.fieldNameStyle || {})
    const [descriptionStyles, setDescriptionStyles] = useState(
        formField?.fieldDescriptionStyle || {}
    )
    const [exampleStyles, setExampleStyles] = useState(formField?.fieldExampleStyle || {})
    const [background, setBackground] = useState(formField?.background || '#000000')

    const fieldNameInputRef = useRef<HTMLInputElement>(null)
    const fieldDescriptionInputRef = useRef<HTMLInputElement>(null)
    const fieldExampleInputRef = useRef<HTMLInputElement>(null)
    const fieldRequiredInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (!formField?.fieldName) return
        if (!fieldNameInputRef.current) return
        if (fieldNameInputRef.current.value) return

        fieldNameInputRef.current.value = formField.fieldName
    }, [formField?.fieldName])

    useEffect(() => {
        if (!formField?.fieldDescription) return
        if (!fieldDescriptionInputRef.current) return
        if (fieldDescriptionInputRef.current.value) return

        fieldDescriptionInputRef.current.value = formField.fieldDescription
    }, [formField?.fieldDescription])

    useEffect(() => {
        if (!formField?.fieldExample) return
        if (!fieldExampleInputRef.current) return
        if (fieldExampleInputRef.current.value) return

        fieldExampleInputRef.current.value = formField.fieldExample
    }, [formField?.fieldExample])

    useEffect(() => {
        if (!formField?.required) return
        if (!fieldRequiredInputRef.current) return
        if (fieldRequiredInputRef.current.value) return

        fieldRequiredInputRef.current.checked = formField.required
    }, [formField?.required])

    return (
        <>
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
                            ref={fieldNameInputRef}
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
                            ref={fieldExampleInputRef}
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
                        ref={fieldDescriptionInputRef}
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
                        onChange={(e) => {
                            const type = e as fieldTypes['fieldType']
                            setFieldType(type)
                        }}
                        defaultValue={'text'}
                    >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="email">Email</option>
                        <option value="phone">Phone</option>
                        <option value="address">Address</option>
                    </Select>
                </div>

                <div className="w-full">
                    <div className="inline-flex fields-center">
                        <label
                            className="relative flex fields-center p-3 rounded-full cursor-pointer"
                            htmlFor="req-desc"
                        >
                            <input type="checkbox" ref={fieldRequiredInputRef} id="req-desc" />
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
            </div>
            <div className="flex flex-col gap-2 w-full">
                <h2 className="text-2xl text-center">Field styles customizations</h2>
                <TextSlideStyleConfig
                    name="Field name"
                    config={nameStyles}
                    updateConfig={(fieldNameStyle) => {
                        if (formField) {
                            onUpdateField({
                                ...formField,
                                fieldNameStyle,
                            })
                            return
                        }
                        setNameStyles(fieldNameStyle)
                    }}
                    background={formField?.background}
                    setBackground={(bg) => {
                        if (formField) {
                            onUpdateField({
                                ...formField,
                                background: bg,
                            })
                            return
                        }
                        setBackground(bg)
                    }}
                />
                <TextSlideStyleConfig
                    name="Field description"
                    config={descriptionStyles}
                    updateConfig={(fieldDescriptionStyle) => {
                        if (formField) {
                            onUpdateField({
                                ...formField,
                                fieldDescriptionStyle,
                            })
                            return
                        }
                        setDescriptionStyles(fieldDescriptionStyle)
                    }}
                />
                <TextSlideStyleConfig
                    name="Field example"
                    config={exampleStyles}
                    updateConfig={(fieldExampleStyle) => {
                        if (formField) {
                            onUpdateField({
                                ...formField,
                                fieldExampleStyle,
                            })
                            return
                        }
                        setExampleStyles(fieldExampleStyle)
                    }}
                />
            </div>
            {formField ? null : (
                <Button
                    type="button"
                    onClick={() => {
                        if (
                            !(
                                fieldNameInputRef.current?.value &&
                                fieldDescriptionInputRef.current?.value &&
                                fieldExampleInputRef.current?.value
                            )
                        )
                            return
                        const fieldName = fieldNameInputRef.current.value
                        const fieldDescription = fieldDescriptionInputRef.current.value
                        const fieldExample = fieldExampleInputRef.current.value
                        const required = !!fieldRequiredInputRef.current?.checked

                        onUpdateField({
                            fieldName,
                            fieldDescription,
                            fieldExample,
                            fieldType,
                            required,
                            background,
                            fieldNameStyle: nameStyles,
                            fieldDescriptionStyle: descriptionStyles,
                            fieldExampleStyle: exampleStyles,
                        })
                        setFieldType('text')
                        fieldNameInputRef.current.value = ''
                        fieldRequiredInputRef.current!.checked = false
                        fieldDescriptionInputRef.current.value = ''
                        fieldExampleInputRef.current.value = ''
                    }}
                    className="w-full bg-border hover:bg-secondary-border text-primary"
                >
                    {isEditing ? (
                        <LoaderIcon className="animate-spin" />
                    ) : (
                        `${formField ? 'Edit' : 'Add'} Field`
                    )}
                </Button>
            )}
        </>
    )
}
