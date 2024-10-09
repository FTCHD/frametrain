'use client'
import { BasicViewInspector, Button, Checkbox, Input, Modal, Select, Table } from '@/sdk/components'
import { useFrameConfig, useFrameId, useFrameStorage, useUploadImage } from '@/sdk/hooks'
import { Configuration } from '@/sdk/inspector'
import { Trash } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import type { Config, Storage } from '.'
import { humanizeTimestamp } from './utils'

function downloadCSV(storage: Storage, fileName: string, inputNames: string[]): void {
    // Column names
    const columnNames = ['Date', 'User', ...inputNames]

    // Rows
    const rows = Object.entries(storage.submissions).map(([userId, record]) => [
        humanizeTimestamp(record.timestamp),
        userId,
        ...inputNames.map((name) => record[name]),
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

export default function Inspector() {
    const [config, updateConfig] = useFrameConfig<Config>()
    const uploadImage = useUploadImage()
    const frameId = useFrameId()
    const [storage, updateStorage] = useFrameStorage<Storage>()

    const [uploading, setUploading] = useState(false)

    return (
        <Configuration.Root>
            <Configuration.Section title="Actions">
                <div className="flex flex-row gap-1">
                    <Modal.Root>
                        <Modal.Trigger asChild={true}>
                            <Button className="flex-1">Show Submissions</Button>
                        </Modal.Trigger>
                        <Modal.Content>
                            <Modal.Header>
                                <Modal.Title>Form Submissions</Modal.Title>
                                {/* <Modal.Description>{JSON.stringify(storage)}</Modal.Description> */}
                                <Modal.Description>
                                    <Table.Root>
                                        <Table.Caption>
                                            {Object.keys(storage?.submissions || {}).length || 0}{' '}
                                            Submission(s)
                                        </Table.Caption>
                                        <Table.Header>
                                            <Table.Row>
                                                <Table.Head className="w-[100px]">Date</Table.Head>
                                                <Table.Head className="w-[100px]">User</Table.Head>
                                                {[
                                                    ...(config?.fields || []).map(
                                                        (field) => field.label
                                                    ),
                                                ].map((label, index) => (
                                                    <Table.Head key={index} className="w-[100px]">
                                                        {label}
                                                    </Table.Head>
                                                ))}
                                            </Table.Row>
                                        </Table.Header>
                                        <Table.Body>
                                            {Object.keys(storage?.submissions || {}).map(
                                                (submitterId, rowIndex) => (
                                                    <Table.Row key={rowIndex}>
                                                        <Table.Cell className="font-medium">
                                                            {humanizeTimestamp(
                                                                storage.submissions[submitterId]
                                                                    .timestamp
                                                            )}
                                                        </Table.Cell>
                                                        <Table.Cell className="font-medium">
                                                            {submitterId}
                                                        </Table.Cell>
                                                        {Object.keys(
                                                            storage.submissions[submitterId] || {}
                                                        ).map(
                                                            (fieldLabel, index) =>
                                                                fieldLabel !== 'timestamp' && (
                                                                    <Table.Cell key={index}>
                                                                        {
                                                                            storage.submissions[
                                                                                submitterId
                                                                            ][fieldLabel]
                                                                        }
                                                                    </Table.Cell>
                                                                )
                                                        )}
                                                    </Table.Row>
                                                )
                                            )}
                                        </Table.Body>
                                    </Table.Root>
                                </Modal.Description>
                            </Modal.Header>
                        </Modal.Content>
                    </Modal.Root>

                    <Button
                        onClick={() => {
                            if (
                                // biome-ignore lint/complexity/useSimplifiedLogicExpression: <>
                                !(config?.fields || []).length ||
                                !Object.keys(storage?.submissions || {}).length
                            ) {
                                toast.error('No data to download')
                                return
                            }

                            downloadCSV(storage as Storage, `${frameId}-submissions.csv`, [
                                ...config.fields.map((field) => field.label),
                            ])
                        }}
                    >
                        Download CSV
                    </Button>

                    <Button
                        className="flex-1"
                        onClick={() => {
                            updateConfig({
                                fields: [...(config.fields || []), {}],
                            })
                        }}
                    >
                        Create Field
                    </Button>

                    <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => {
                            updateConfig({ fields: [] })
                        }}
                    >
                        Delete All Fields
                    </Button>
                </div>
            </Configuration.Section>

            <Configuration.Section
                title="Cover"
                actions={
                    config.coverType && config.coverType !== 'disabled'
                        ? [
                              <Button
                                  key={'delete-success'}
                                  onClick={() => {
                                      updateConfig({
                                          coverType: 'disabled',
                                          coverImageUrl: undefined,
                                          coverAspectRatio: '1:1',
                                          coverStyling: undefined,
                                      })
                                  }}
                                  variant="link"
                                  size={'sm'}
                              >
                                  <Trash size={16} className="text-red-500" />
                              </Button>,
                              <Select
                                  key={'select success'}
                                  className="p-0 pl-2 border-0 bg-transparent h-fit w-fit focus:ring-0"
                                  defaultValue={config.coverAspectRatio}
                                  placeholder="Select an aspect ratio"
                                  onChange={(newValue) => {
                                      updateConfig({
                                          coverAspectRatio: newValue,
                                      })
                                  }}
                              >
                                  <option key="1:1" value="1:1">
                                      1:1
                                  </option>
                                  <option key="1.91:1" value="1.91:1">
                                      1.91:1
                                  </option>
                              </Select>,
                          ]
                        : []
                }
            >
                {/* <pre className="absolute bottom-0 left-0 bg-slate-600 p-2 ">
                    {JSON.stringify(config, null, 2)}
                </pre> */}

                {(!config.coverType || config.coverType === 'disabled') && (
                    <Select
                        defaultValue={
                            config.coverType === 'disabled' ? undefined : config.coverType
                        }
                        onChange={(newValue) => {
                            updateConfig({ coverType: newValue })
                        }}
                        placeholder="Select a cover type"
                    >
                        <option key="image" value="image">
                            Image
                        </option>
                        <option key="text" value="text">
                            Text
                        </option>
                    </Select>
                )}

                {config.coverType === 'text' && (
                    <BasicViewInspector
                        name="Cover"
                        title={config?.coverStyling?.title || { text: '' }}
                        subtitle={config?.coverStyling?.subtitle || { text: '' }}
                        bottomMessage={config?.coverStyling?.bottomMessage || { text: '' }}
                        background={config?.coverStyling?.background}
                        onUpdate={(coverStyling) => {
                            updateConfig({
                                coverStyling,
                            })
                        }}
                    />
                )}

                {config.coverType === 'image' && (
                    // https://github.com/kushagrasarathe/image-upload-shadcn/blob/main/src/components/image-upload.tsx#L84

                    <div className="flex flex-row gap-1">
                        <label
                            htmlFor="uploadCoverImage"
                            className="flex flex-1 cursor-pointer items-center justify-center rounded-md  py-1.5 px-2 text-md font-medium bg-border  text-primary hover:bg-secondary-border"
                        >
                            Upload Image
                            <Input
                                id="uploadCoverImage"
                                accept="image/*"
                                type="file"
                                disabled={uploading}
                                onChange={async (e) => {
                                    if (e.target.files?.[0]) {
                                        const file = e.target.files?.[0]
                                        if (uploading) return

                                        const reader = new FileReader()
                                        reader.readAsDataURL(file)

                                        const base64String = (await new Promise((resolve) => {
                                            reader.onload = () => {
                                                const base64String = (
                                                    reader.result as string
                                                ).split(',')[1]
                                                resolve(base64String)
                                            }
                                        })) as string

                                        const contentType = e.target.files[0].type as
                                            | 'image/png'
                                            | 'image/jpeg'
                                            | 'image/gif'
                                            | 'image/webp'

                                        const { fileName } = await uploadImage({
                                            base64String: base64String,
                                            contentType: contentType,
                                        })

                                        const imageUrl =
                                            process.env.NEXT_PUBLIC_CDN_HOST +
                                            '/frames/' +
                                            frameId +
                                            '/' +
                                            fileName

                                        updateConfig({ coverImageUrl: imageUrl })
                                    }
                                }}
                                className="sr-only "
                            />
                        </label>
                        <Button
                            className="flex-1"
                            variant={'primary'}
                            onClick={async () => {
                                const imageUrl = prompt('Enter the image URL')

                                if (imageUrl) {
                                    updateConfig({
                                        coverImageUrl: imageUrl,
                                    })
                                }
                            }}
                        >
                            Image from URL
                        </Button>
                    </div>
                )}
            </Configuration.Section>

            <Configuration.Section
                title="Success"
                actions={
                    config.successType && config.successType !== 'disabled'
                        ? [
                              <Button
                                  key={'delete-success'}
                                  onClick={() => {
                                      updateConfig({
                                          successType: 'disabled',
                                          successImageUrl: undefined,
                                          successFrameUrl: undefined,
                                          successButtons: [],
                                          successStyling: undefined,
                                      })
                                  }}
                                  variant="link"
                                  size={'sm'}
                              >
                                  <Trash size={16} className="text-red-500" />
                              </Button>,
                              config.successType !== 'frame' && (
                                  <Select
                                      key={'select success'}
                                      className="p-0 pl-2 border-0 bg-transparent h-fit w-fit focus:ring-0"
                                      defaultValue={config.successAspectRatio}
                                      placeholder="Select an aspect ratio"
                                      onChange={(newValue) => {
                                          updateConfig({
                                              successAspectRatio: newValue,
                                          })
                                      }}
                                  >
                                      <option key="1:1" value="1:1">
                                          1:1
                                      </option>
                                      <option key="1.91:1" value="1.91:1">
                                          1.91:1
                                      </option>
                                  </Select>
                              ),
                          ]
                        : []
                }
            >
                {(!config.successType || config.successType === 'disabled') && (
                    <Select
                        value={config.successType === 'disabled' ? undefined : config.successType}
                        onChange={(newValue) => {
                            updateConfig({
                                successType: newValue,
                                successButtons: [],
                                successImageUrl: undefined,
                                successFrameUrl: undefined,
                            })
                        }}
                        placeholder="Select a type for the success screen"
                    >
                        <option key="image" value="image">
                            Image
                        </option>
                        <option key="text" value="text">
                            Text
                        </option>
                        <option key="frame" value="frame">
                            Frame
                        </option>
                    </Select>
                )}

                {config.successType === 'text' && (
                    <>
                        <div className="flex flex-col w-full">
                            <h2 className="text-md font-medium">Buttons</h2>
                            <div className="flex flex-col w-full gap-1">
                                {Array.from({ length: 4 }).map((_, iButtons) => (
                                    <div
                                        key={iButtons}
                                        className="flex flex-row items-center gap-1"
                                    >
                                        {!config.successButtons?.[iButtons] ? (
                                            <div className="flex items-center w-full">
                                                <Select
                                                    onChange={(newValue) => {
                                                        const updatedButtons = [
                                                            ...(config.successButtons || []),
                                                            {
                                                                type: newValue,
                                                                target: '',
                                                            },
                                                        ]

                                                        updateConfig({
                                                            successButtons: updatedButtons,
                                                        })
                                                    }}
                                                    placeholder="Select a type to enable this button"
                                                >
                                                    <option key="link" value="link">
                                                        Link
                                                    </option>
                                                    <option key="frame" value="frame">
                                                        Frame
                                                    </option>
                                                </Select>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex items-center w-1/5">
                                                    <Select
                                                        defaultValue={
                                                            config.successButtons?.[iButtons]
                                                                ?.type || 'DISABLED'
                                                        }
                                                        onChange={(newValue) => {
                                                            if (newValue === 'DISABLED') {
                                                                // remove this button
                                                                const updatedButtons =
                                                                    config?.successButtons?.filter(
                                                                        (_, i) => i !== iButtons
                                                                    )

                                                                updateConfig({
                                                                    successButtons: updatedButtons,
                                                                })
                                                                return
                                                            }

                                                            const existingButton =
                                                                config.successButtons?.[iButtons]

                                                            if (existingButton) {
                                                                // update this button
                                                                const updatedButtons =
                                                                    config?.successButtons?.map(
                                                                        (button, i) =>
                                                                            i === iButtons
                                                                                ? {
                                                                                      ...button,
                                                                                      type: newValue,
                                                                                      target: '',
                                                                                  }
                                                                                : button
                                                                    )

                                                                updateConfig({
                                                                    successButtons: updatedButtons,
                                                                })
                                                            } else {
                                                                // add this button
                                                                const updatedButtons = [
                                                                    ...(config.successButtons ||
                                                                        []),
                                                                    {
                                                                        type: newValue,
                                                                        target: '',
                                                                    },
                                                                ]

                                                                updateConfig({
                                                                    successButtons: updatedButtons,
                                                                })
                                                            }
                                                        }}
                                                        placeholder="Select type"
                                                    >
                                                        <option key="DISABLED" value="DISABLED">
                                                            Disabled
                                                        </option>
                                                        <option key="link" value="link">
                                                            Link
                                                        </option>
                                                        <option key="frame" value="frame">
                                                            Frame
                                                        </option>
                                                    </Select>
                                                </div>
                                                <div className="flex items-center w-2/5">
                                                    {config.successButtons?.[iButtons]?.type ===
                                                        'link' && (
                                                        <Input
                                                            defaultValue={
                                                                config.successButtons?.[iButtons]
                                                                    ?.target
                                                            }
                                                            placeholder="URL (https://)"
                                                            type="url"
                                                            onChange={(e) => {
                                                                const updatedButtons =
                                                                    config?.successButtons?.map(
                                                                        (button, i) => ({
                                                                            ...button,
                                                                            target:
                                                                                i === iButtons
                                                                                    ? e.target.value
                                                                                    : button.target,
                                                                        })
                                                                    )

                                                                updateConfig({
                                                                    successButtons: updatedButtons,
                                                                })
                                                            }}
                                                        />
                                                    )}

                                                    {config.successButtons?.[iButtons]?.type ===
                                                        'frame' && (
                                                        <Input
                                                            defaultValue={
                                                                config.successButtons?.[iButtons]
                                                                    ?.target
                                                            }
                                                            placeholder="Frame URL (https://)"
                                                            type="url"
                                                            onChange={(e) => {
                                                                const updatedButtons =
                                                                    config?.successButtons?.map(
                                                                        (button, i) => ({
                                                                            ...button,
                                                                            target:
                                                                                i === iButtons
                                                                                    ? e.target.value
                                                                                    : button.target,
                                                                        })
                                                                    )

                                                                updateConfig({
                                                                    successButtons: updatedButtons,
                                                                })
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                                <div className="flex items-center w-2/5">
                                                    {config.successButtons?.[iButtons]?.type && (
                                                        <Input
                                                            defaultValue={
                                                                config.successButtons?.[iButtons]
                                                                    ?.text
                                                            }
                                                            placeholder="Label"
                                                            onChange={(e) => {
                                                                const updatedButtons =
                                                                    config?.successButtons?.map(
                                                                        (button, i) => ({
                                                                            ...button,
                                                                            text:
                                                                                i === iButtons
                                                                                    ? e.target.value
                                                                                    : button.text,
                                                                        })
                                                                    )

                                                                updateConfig({
                                                                    successButtons: updatedButtons,
                                                                })
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <BasicViewInspector
                            name="Success"
                            title={config?.successStyling?.title || { text: '' }}
                            subtitle={config?.successStyling?.subtitle || { text: '' }}
                            bottomMessage={config?.successStyling?.bottomMessage || { text: '' }}
                            background={config?.successStyling?.background}
                            onUpdate={(successStyling) => {
                                updateConfig({
                                    successStyling,
                                })
                            }}
                        />
                    </>
                )}

                {config.successType === 'frame' && (
                    <Input
                        defaultValue={config?.successFrameUrl}
                        onChange={(newValue) => {
                            updateConfig({ successFrameUrl: newValue.target.value })
                        }}
                        placeholder="Frame URL (https://)"
                    />
                )}

                {config.successType === 'image' && !config.successImageUrl && (
                    <div className="flex flex-row gap-1">
                        <label
                            htmlFor="uploadImage"
                            className="flex flex-1 cursor-pointer items-center justify-center rounded-md  py-1.5 px-2 text-md font-medium bg-border  text-primary hover:bg-secondary-border"
                        >
                            Upload Image
                            <Input
                                id="uploadImage"
                                accept="image/*"
                                type="file"
                                disabled={uploading}
                                onChange={async (e) => {
                                    if (e.target.files?.[0]) {
                                        const file = e.target.files?.[0]
                                        if (uploading) return

                                        const reader = new FileReader()
                                        reader.readAsDataURL(file)

                                        const base64String = (await new Promise((resolve) => {
                                            reader.onload = () => {
                                                const base64String = (
                                                    reader.result as string
                                                ).split(',')[1]
                                                resolve(base64String)
                                            }
                                        })) as string

                                        const contentType = e.target.files[0].type as
                                            | 'image/png'
                                            | 'image/jpeg'
                                            | 'image/gif'
                                            | 'image/webp'

                                        const { fileName } = await uploadImage({
                                            base64String: base64String,
                                            contentType: contentType,
                                        })

                                        const imageUrl =
                                            process.env.NEXT_PUBLIC_CDN_HOST +
                                            '/frames/' +
                                            frameId +
                                            '/' +
                                            fileName

                                        updateConfig({ successImageUrl: imageUrl })
                                    }
                                }}
                                className="sr-only "
                            />
                        </label>
                        <Button
                            className="flex-1"
                            variant={'primary'}
                            onClick={async () => {
                                const imageUrl = prompt('Enter the image URL')

                                if (imageUrl) {
                                    updateConfig({
                                        successImageUrl: imageUrl,
                                    })
                                }
                            }}
                        >
                            Image from URL
                        </Button>
                    </div>
                )}
                {config.successImageUrl && (
                    <div className="flex flex-row gap-2">
                        <div className="flex flex-col gap-1 relative w-1/4">
                            <img
                                src={config.successImageUrl}
                                alt="Success"
                                width={100}
                                height={100}
                                className="w-full h-full object-contain"
                            />
                            <label
                                htmlFor="changeImage"
                                className="flex flex-1 cursor-pointer items-center justify-center rounded-md  py-1.5 px-2 text-md font-medium bg-border  text-primary hover:bg-secondary-border"
                            >
                                Change Image
                                <Input
                                    id="changeImage"
                                    accept="image/*"
                                    type="file"
                                    disabled={uploading}
                                    onChange={async (e) => {
                                        if (e.target.files?.[0]) {
                                            const file = e.target.files?.[0]
                                            if (uploading) return

                                            const reader = new FileReader()
                                            reader.readAsDataURL(file)

                                            const base64String = (await new Promise((resolve) => {
                                                reader.onload = () => {
                                                    const base64String = (
                                                        reader.result as string
                                                    ).split(',')[1]
                                                    resolve(base64String)
                                                }
                                            })) as string

                                            const contentType = e.target.files[0].type as
                                                | 'image/png'
                                                | 'image/jpeg'
                                                | 'image/gif'
                                                | 'image/webp'

                                            const { fileName } = await uploadImage({
                                                base64String: base64String,
                                                contentType: contentType,
                                            })

                                            const imageUrl =
                                                process.env.NEXT_PUBLIC_CDN_HOST +
                                                '/frames/' +
                                                frameId +
                                                '/' +
                                                fileName

                                            updateConfig({ successImageUrl: imageUrl })
                                        }
                                    }}
                                    className="sr-only "
                                />
                            </label>
                        </div>
                        <div className="flex flex-col justify-between w-3/4 gap-1">
                            {Array.from({ length: 4 }).map((_, iButtons) => (
                                <div key={iButtons} className="flex flex-row items-center gap-1">
                                    {!config.successButtons?.[iButtons] ? (
                                        <div className="flex items-center w-full">
                                            <Select
                                                onChange={(newValue) => {
                                                    const updatedButtons = [
                                                        ...(config.successButtons || []),
                                                        {
                                                            type: newValue,
                                                            target: '',
                                                        },
                                                    ]

                                                    updateConfig({
                                                        successButtons: updatedButtons,
                                                    })
                                                }}
                                                placeholder="Select a type to enable this button"
                                            >
                                                <option key="link" value="link">
                                                    Link
                                                </option>
                                                <option key="frame" value="frame">
                                                    Frame
                                                </option>
                                            </Select>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center w-1/5">
                                                <Select
                                                    defaultValue={
                                                        config.successButtons?.[iButtons]?.type ||
                                                        'DISABLED'
                                                    }
                                                    onChange={(newValue) => {
                                                        if (newValue === 'DISABLED') {
                                                            // remove this button
                                                            const updatedButtons =
                                                                config?.successButtons?.filter(
                                                                    (_, i) => i !== iButtons
                                                                )

                                                            updateConfig({
                                                                successButtons: updatedButtons,
                                                            })
                                                            return
                                                        }

                                                        const existingButton =
                                                            config.successButtons?.[iButtons]

                                                        if (existingButton) {
                                                            // update this button
                                                            const updatedButtons =
                                                                config?.successButtons?.map(
                                                                    (button, i) =>
                                                                        i === iButtons
                                                                            ? {
                                                                                  ...button,
                                                                                  type: newValue,
                                                                                  target: '',
                                                                              }
                                                                            : button
                                                                )

                                                            updateConfig({
                                                                successButtons: updatedButtons,
                                                            })
                                                        } else {
                                                            // add this button
                                                            const updatedButtons = [
                                                                ...(config.successButtons || []),
                                                                {
                                                                    type: newValue,
                                                                    target: '',
                                                                },
                                                            ]

                                                            updateConfig({
                                                                successButtons: updatedButtons,
                                                            })
                                                        }
                                                    }}
                                                    placeholder="Select type"
                                                >
                                                    <option key="DISABLED" value="DISABLED">
                                                        Disabled
                                                    </option>
                                                    <option key="link" value="link">
                                                        Link
                                                    </option>
                                                    <option key="frame" value="frame">
                                                        Frame
                                                    </option>
                                                </Select>
                                            </div>
                                            <div className="flex items-center w-2/5">
                                                {config.successButtons?.[iButtons]?.type ===
                                                    'link' && (
                                                    <Input
                                                        defaultValue={
                                                            config.successButtons?.[iButtons]
                                                                ?.target
                                                        }
                                                        placeholder="URL (https://)"
                                                        type="url"
                                                        onChange={(e) => {
                                                            const updatedButtons =
                                                                config?.successButtons?.map(
                                                                    (button, i) => ({
                                                                        ...button,
                                                                        target:
                                                                            i === iButtons
                                                                                ? e.target.value
                                                                                : button.target,
                                                                    })
                                                                )

                                                            updateConfig({
                                                                successButtons: updatedButtons,
                                                            })
                                                        }}
                                                    />
                                                )}

                                                {config.successButtons?.[iButtons]?.type ===
                                                    'frame' && (
                                                    <Input
                                                        defaultValue={
                                                            config.successButtons?.[iButtons]
                                                                ?.target
                                                        }
                                                        placeholder="Frame URL (https://)"
                                                        type="url"
                                                        onChange={(e) => {
                                                            const updatedButtons =
                                                                config?.successButtons?.map(
                                                                    (button, i) => ({
                                                                        ...button,
                                                                        target:
                                                                            i === iButtons
                                                                                ? e.target.value
                                                                                : button.target,
                                                                    })
                                                                )

                                                            updateConfig({
                                                                successButtons: updatedButtons,
                                                            })
                                                        }}
                                                    />
                                                )}
                                            </div>
                                            <div className="flex items-center w-2/5">
                                                {config.successButtons?.[iButtons]?.type && (
                                                    <Input
                                                        defaultValue={
                                                            config.successButtons?.[iButtons]?.text
                                                        }
                                                        placeholder="Label"
                                                        onChange={(e) => {
                                                            const updatedButtons =
                                                                config?.successButtons?.map(
                                                                    (button, i) => ({
                                                                        ...button,
                                                                        text:
                                                                            i === iButtons
                                                                                ? e.target.value
                                                                                : button.text,
                                                                    })
                                                                )

                                                            updateConfig({
                                                                successButtons: updatedButtons,
                                                            })
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Configuration.Section>

            {config.fields?.map((field, iField) => (
                <Configuration.Section
                    key={iField}
                    title={`Field #${iField + 1}`}
                    actions={[
                        <Button
                            key={iField}
                            onClick={() => {
                                if (config.fields.length === 1) {
                                    updateConfig({
                                        fields: undefined,
                                    })
                                    return
                                }

                                const confirmed = confirm(
                                    'Deleting this field will also delete all submissions for this field, are you sure?'
                                )

                                if (confirmed) {
                                    updateConfig({
                                        fields: config.fields.filter((_, i) => i !== iField),
                                    })
                                }
                            }}
                            variant="link"
                            size={'sm'}
                        >
                            <Trash size={16} className="text-red-500" />
                        </Button>,
                    ]}
                >
                    <div className="flex flex-col gap-2 w-full max-md:gap-0">
                        <h2 className="text-md font-semibold max-md:text-base">Type</h2>

                        <Select
                            value={field?.type}
                            onChange={(newValue) => {
                                if (Object.keys(storage?.submissions || {}).length) {
                                    const confirmed = confirm(
                                        'Changing the field type will delete all submissions for this field, are you sure?'
                                    )

                                    if (!confirmed) {
                                        return
                                    }
                                }

                                updateConfig({
                                    fields: config.fields.map((f, i) =>
                                        i === iField
                                            ? {
                                                  ...f,
                                                  type: newValue,
                                              }
                                            : f
                                    ),
                                })
                                // delete all submissions for this field
                                // update storage

                                if (config.fields.length === 1) {
                                    updateStorage({ submissions: undefined })
                                    return
                                }

                                const newSubmissions = Object.keys(
                                    storage?.submissions || {}
                                ).reduce((acc, submitterId) => {
                                    delete acc[submitterId][field.label]
                                    return acc
                                }, storage?.submissions || {})

                                updateStorage({ submissions: newSubmissions })
                            }}
                            placeholder="Select a type to enable this field"
                        >
                            <option key="text" value="text">
                                Text
                            </option>
                            <option key="choice" value="choice">
                                Choice
                            </option>
                        </Select>
                    </div>

                    {!!field.type && (
                        <div className="flex flex-col gap-2 w-full max-md:gap-0">
                            <h2 className="text-md font-semibold max-md:text-base">Label</h2>
                            <Input
                                defaultValue={field?.label}
                                onChange={(newValue) => {
                                    updateConfig({
                                        fields: config.fields.map((f, i) =>
                                            i === iField
                                                ? { ...f, label: newValue.target.value }
                                                : f
                                        ),
                                    })
                                }}
                                placeholder="Label"
                            />
                        </div>
                    )}

                    {!!field.type && (
                        <div className="flex flex-col gap-2 w-full max-md:gap-0">
                            <h2 className="text-md font-semibold max-md:text-base">Message</h2>
                            <Input
                                defaultValue={field?.message}
                                onChange={(newValue) => {
                                    updateConfig({
                                        fields: config.fields.map((f, i) =>
                                            i === iField
                                                ? { ...f, message: newValue.target.value }
                                                : f
                                        ),
                                    })
                                }}
                                placeholder="Message"
                            />
                        </div>
                    )}

                    {field.type === 'text' && (
                        <div className="flex flex-col gap-2 w-full max-md:gap-0">
                            <h2 className="text-md font-semibold max-md:text-base">Placeholder</h2>
                            <Input
                                defaultValue={field?.placeholder}
                                onChange={(newValue) => {
                                    updateConfig({
                                        fields: config.fields.map((f, i) =>
                                            i === iField
                                                ? { ...f, placeholder: newValue.target.value }
                                                : f
                                        ),
                                    })
                                }}
                                placeholder="Placeholder"
                            />
                        </div>
                    )}

                    {field.type === 'text' && (
                        <div className="flex flex-row gap-2 items-center justify-between w-full max-md:gap-0">
                            <h2 className="text-md font-semibold max-md:text-base">Required</h2>
                            <Checkbox
                                defaultChecked={field?.required}
                                onCheckedChange={(newValue) => {
                                    updateConfig({
                                        fields: config.fields.map((f, i) =>
                                            i === iField ? { ...f, required: newValue } : f
                                        ),
                                    })
                                }}
                            />
                        </div>
                    )}

                    {field.type === 'choice' && (
                        <div className="flex flex-col gap-2 w-full max-md:gap-0">
                            <h2 className="text-md font-semibold max-md:text-base">Options</h2>
                            <div className="flex flex-row gap-2">
                                <Input
                                    defaultValue={field.options?.[0]}
                                    onChange={(newValue) => {
                                        updateConfig({
                                            fields: config.fields.map((f, i) =>
                                                i === iField
                                                    ? {
                                                          ...f,
                                                          options: [
                                                              newValue.target.value,
                                                              f?.options?.[1] || undefined,
                                                              f?.options?.[2] || undefined,
                                                              f?.options?.[3] || undefined,
                                                          ],
                                                      }
                                                    : f
                                            ),
                                        })
                                    }}
                                />
                                <Input
                                    defaultValue={field?.options?.[1]}
                                    disabled={!field?.options?.[0]}
                                    onChange={(newValue) => {
                                        updateConfig({
                                            fields: config.fields.map((f, i) =>
                                                i === iField
                                                    ? {
                                                          ...f,
                                                          options: [
                                                              f?.options?.[0] || undefined,
                                                              newValue.target.value,
                                                              f?.options?.[2] || undefined,
                                                              f?.options?.[3] || undefined,
                                                          ],
                                                      }
                                                    : f
                                            ),
                                        })
                                    }}
                                />
                                <Input
                                    defaultValue={field?.options?.[2]}
                                    disabled={!field?.options?.[0] || !field?.options?.[1]}
                                    onChange={(newValue) => {
                                        updateConfig({
                                            fields: config.fields.map((f, i) =>
                                                i === iField
                                                    ? {
                                                          ...f,
                                                          options: [
                                                              f?.options?.[0] || undefined,
                                                              f?.options?.[1] || undefined,
                                                              newValue.target.value,
                                                              f?.options?.[3] || undefined,
                                                          ],
                                                      }
                                                    : f
                                            ),
                                        })
                                    }}
                                />
                                <Input
                                    defaultValue={field?.options?.[3]}
                                    disabled={
                                        !field?.options?.[0] ||
                                        !field?.options?.[1] ||
                                        !field?.options?.[2]
                                    }
                                    onChange={(newValue) => {
                                        updateConfig({
                                            fields: config.fields.map((f, i) =>
                                                i === iField
                                                    ? {
                                                          ...f,
                                                          options: [
                                                              f?.options?.[0] || undefined,
                                                              f?.options?.[1] || undefined,
                                                              f?.options?.[2] || undefined,
                                                              newValue.target.value,
                                                          ],
                                                      }
                                                    : f
                                            ),
                                        })
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </Configuration.Section>
            ))}
        </Configuration.Root>
    )
}
