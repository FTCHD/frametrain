'use client'
import { Button } from '@/components/shadcn/Button'
import { Separator } from '@/components/shadcn/Separator'
import { useFrameConfig, useFrameId } from '@/sdk/hooks'
import { Trash } from 'lucide-react'
import { type ReactNode, useEffect, useState } from 'react'
import type { Config, fieldTypes } from '.'
import FormEditor from './components/FormEditor'
import FormFieldEditor from './components/FormFieldEditor'

type FormFieldMenuItem = {
    title: string
    description: string
    key: string
}

export default function Inspector() {
    const frameId = useFrameId()
    const [config, updateConfig] = useFrameConfig<Config>()

    const [activeTab, setActiveTab] = useState('form')
    const [savingField, setSavingField] = useState(false)

    const fields: fieldTypes[] = config.fields
    const fieldIds = fields.map((field, index) => `${index + 1}_${field.fieldName}`)
    const tabs = ['form', ...fieldIds].map((tab) => {
        const key = tab
        const split = key.split('_')
        let title = 'Form'
        if (split.length > 1) {
            title = `${split[0]}. ${split[1]}`
        }

        return {
            key,
            title,
            description: `Configure ${
                key === 'form' ? 'your form' : `the settings for ${split[1]} for field`
            }`,
        }
    })

    const foundTab = tabs.find((tab) => tab.key === activeTab)
    const tab = foundTab || tabs[0]

    useEffect(() => {
        if (!config?.frameId || config.frameId === '') {
            updateConfig({ frameId: frameId })
        }
    }, [updateConfig, config.frameId, frameId])

    const fieldId = Number(tab.key.split('_')[0]) - 1
    const field = fields.find((_, index) => index === fieldId)

    const renderTab = (tab: FormFieldMenuItem) => {
        let component: ReactNode = null
        switch (tab.key) {
            case 'form': {
                component = <FormEditor isEditing={savingField} />
                break
            }

            default: {
                component = (
                    <>
                        {field ? (
                            <FormFieldEditor
                                isEditing={savingField}
                                formField={field}
                                onUpdateField={(updatedField) => {
                                    setSavingField(true)
                                    const updatedFields = fields.map((f, index) =>
                                        index === fieldId ? updatedField : f
                                    )
                                    updateConfig({ fields: updatedFields })
                                    setSavingField(false)
                                }}
                            />
                        ) : (
                            <h2 className="text-2xl font-semibold">
                                Selected field does not exist. Please select a valid field to edit.
                            </h2>
                        )}
                    </>
                )
                break
            }
        }

        return <>{component}</>
    }

    return (
        <div className="w-full h-full space-y-4">
            <div className="grid grid-cols-3 gap-px w-full">
                {tabs.map((tab) => (
                    <Button
                        variant="ghost"
                        key={tab.key}
                        className={`justify-start w-max ${
                            activeTab === tab.key
                                ? 'bg-muted hover:bg-muted hover:opacity-80'
                                : 'hover:bg-muted hover:opacity-50 hover:underline'
                        }`}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.title}
                    </Button>
                ))}
            </div>
            <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-medium">{tab.title}</h2>
                    {field ? (
                        <Button
                            variant={'destructive'}
                            onClick={() => {
                                setActiveTab('form')
                                updateConfig({
                                    fields: [
                                        ...fields.slice(0, fieldId),
                                        ...fields.slice(fieldId + 1),
                                    ],
                                })
                            }}
                        >
                            <Trash />
                        </Button>
                    ) : null}
                </div>
                <p className="text-sm text-muted-foreground">{tab.description}</p>
                <Separator />
            </div>
            {renderTab(tab)}
        </div>
    )
}
