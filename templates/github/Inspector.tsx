'use client'
import { Button } from '@/components/shadcn/Button'
import { Input } from '@/components/shadcn/Input'
import { useFrameConfig, useUploadImage } from '@/sdk/hooks'
import { useRef, useState } from 'react'
import type { Config } from '.'

import { ColorPicker, FontFamilyPicker, FontStylePicker, FontWeightPicker } from '@/sdk/components'

export default function Inspector() {
    const [config, updateConfig] = useFrameConfig<Config>()
    const uploadImage = useUploadImage()

    const displayLabelInputRef = useRef<HTMLInputElement>(null)
    const apikey = process.env.NEXT_PUBLIC_GITHUB_KEY

    const baseUrl = 'https://api.github.com/graphql'

    const headers = {
        'Content-Type': 'application/json',
        Authorization: `bearer ${apikey}`,
    }
    const fetchGitHubData = async (user: any) => {
        const body = {
            query: `query {
        user(login: "${user}") {
          avatarUrl
          repositories {
            totalCount
          }
          contributionsCollection {
            contributionCalendar {
              totalContributions
            }
          }
          pullRequests {
            totalCount
          }
          starredRepositories {
            totalCount
          }
          issues {
            totalCount
          }
          hovercard {
            contexts {
              message
            }
          }
        }
      }`,
        }

        try {
            const response = await fetch(baseUrl, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body),
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json()
            console.log(JSON.stringify(data?.data.user, null, 2)) // Pretty print JSON
            return data
        } catch (error) {
            console.error('Error fetching data: ', error)
        }
    }

    return (
        <div className="w-full h-full space-y-4">
            <p>{JSON.stringify(config)}</p>
            <h2 className="text-lg font-semibold">Github Stats</h2>

            <h3 className="text-lg ">Github Username</h3>

            <p>{config.json}</p>

            <div className="flex flex-col gap-2 ">
                <Input
                    className="text-lg"
                    placeholder="Enter your github username"
                    ref={displayLabelInputRef}
                    onChange={async (e) => {
                        if (!e.target?.value) return

                        const data = await fetchGitHubData(e.target.value)
                        if (!data?.data?.user) return
                        updateConfig({
                            name: e.target.value,
                            repo: data?.data.user.repositories.totalCount,
                            commits:
                                data?.data.user.contributionsCollection.contributionCalendar
                                    .totalContributions,
                            pr: data?.data.user.pullRequests.totalCount,
                            issues: data?.data.user.issues.totalCount,
                            imageUrl: data?.data.user.avatarUrl,
                        })
                    }}
                />
                <div className="flex flex-col gap-2 w-full">
                    <h2 className="text-lg">Font</h2>
                    <FontFamilyPicker
                        onSelect={(font) => {
                            updateConfig({
                                fontFamily: font,
                            })
                        }}
                    />
                </div>
                <div className="flex flex-col gap-2 w-full">
                    <h2 className="text-lg">Title Color</h2>
                    <ColorPicker
                        className="w-full"
                        background={config.titleColo || '#08F720'}
                        setBackground={(value: string) =>
                            updateConfig({
                                titleColor: value,
                            })
                        }
                    />
                </div>
                <div className="flex flex-col gap-2 w-full">
                    <h2 className="text-lg">Title Weight</h2>
                    <FontWeightPicker
                        currentFont={config.fontFamily || 'Roboto'}
                        defaultValue={config.fontFamily}
                        onSelect={(weight) =>
                            updateConfig({
                                titleWeight: weight,
                            })
                        }
                    />
                </div>
                <div className="flex flex-col gap-2 w-full">
                    <h2 className="text-lg">Title Style</h2>

                    <FontStylePicker
                        currentFont={config.titleStyle || 'normal'}
                        defaultValue={config.titleStyle}
                        onSelect={(style) =>
                            updateConfig({
                                titleStyle: style,
                            })
                        }
                    />
                </div>
                <div className="flex flex-col gap-2 w-full">
                    <h2 className="text-lg">Background</h2>
                    <ColorPicker
                        className="w-full"
                        enabledPickers={['solid', 'gradient']}
                        background={config.background || '#0f0c29'}
                        setBackground={(e) =>
                            updateConfig({
                                background: e,
                            })
                        }
                        uploadBackground={async (base64String, contentType) => {
                            const { filePath } = await uploadImage({
                                base64String: base64String,
                                contentType: contentType,
                            })

                            return filePath
                        }}
                    />
                </div>
                <div className="flex flex-col gap-2 w-full">
                    <h2 className="text-lg">Body Color</h2>
                    <ColorPicker
                        className="w-full"
                        background={config.bodyColor || 'black'}
                        setBackground={(value: string) =>
                            updateConfig({
                                bodyColor: value,
                            })
                        }
                    />
                </div>

                {/* <Button
                    onClick={async () => {
                        if (!displayLabelInputRef.current?.value) return

                        const data = await fetchGitHubData(displayLabelInputRef.current?.value)
                        updateConfig({
                            ...localConfig,
                            name: displayLabelInputRef.current.value,
                            repo: data.data.user.repositories.totalCount,
                            commits:
                                data.data.user.contributionsCollection.contributionCalendar
                                    .totalContributions,
                            pr: data.data.user.pullRequests.totalCount,
                            issues: data.data.user.issues.totalCount,
                            imageUrl: data.data.user.avatarUrl,
                        })

                        displayLabelInputRef.current.value = ''
                    }}
                    className="w-full bg-border hover:bg-secondary-border text-primary"
                >
                    Create stats
                </Button> */}
            </div>
        </div>
    )
}
