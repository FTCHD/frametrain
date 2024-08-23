'use client'
import { createFrame } from '@/lib/frame'
import type templates from '@/templates'
import { useSession } from 'next-auth/react'
import NextImage from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Plus } from 'react-feather'
import { Separator } from '../shadcn/Separator'

export default function TemplateCard({
    template,
}: {
    template: (typeof templates)[keyof typeof templates]
}) {
    const sesh = useSession()
    const router = useRouter()

    const [isLoading, setLoading] = useState(false)

    const { name, description, creatorName, cover } = template

    async function createAndNavigate() {
        if (!sesh.data?.user) {
            document.querySelector('.fc-authkit-signin-button')?.querySelector('button')?.click()
            return
        }
        setLoading(true)
        const newFrame = await createFrame({
            name: 'My Frame',
            template: template.name.toLowerCase() as keyof typeof templates,
        })
        router.push('/frame/' + newFrame.id)
    }

    return (
        <button
            type="button"
            className={`transition ease-in-out group w-[350px] h-[380px] flex flex-col rounded-md border-[#32383E] border hover:border-[#12467B]   ${
                isLoading ? 'animate-pulse' : ''
            }`}
            disabled={isLoading}
            onClick={createAndNavigate}
        >
            <div className="relative w-full h-full">
                <NextImage
                    src={cover}
                    alt={name}
                    fill={true}
                    className="object-cover h-64 rounded-t-md"
                />
                <div className="ease-in-out bg-[#0B0D0E] inline-flex absolute right-4 -bottom-8 justify-center items-center w-14 h-14 rounded-full bg-background group-hover:bg-red-600 group-hover:text-white transition duration-150">
                    <Plus size={32} />
                </div>
            </div>

            <div className="flex flex-col justify-between w-full h-full">
                <div className="flex flex-col gap-2 items-start p-4 text-start">
                    <p className="text-xl font-semibold">{name + ' Template'}</p>
                    <p className="text-md text-[#cdd7e1]">{description}</p>
                </div>

                <div className="flex flex-col items-start bg-[#171a1c] rounded-b-md">
                    <Separator className="bg-[#32383E]" />
                    <p className="text-xs text-start font-medium text-[#9fa6ad] p-3">
                        Created by {creatorName}
                    </p>
                </div>
            </div>
        </button>
    )
}
