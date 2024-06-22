'use client'

import { Input } from '@/components/shadcn/Input'

export default function UploadSlide({
    setSlide,
    uploadSlide,
    htmlFor,
}: {
    setSlide: (slide: string) => void
    uploadSlide: (
        base64String: string,
        contentType: 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp'
    ) => Promise<string | undefined>
    htmlFor: string
}) {
    return (
        <Input
            accept="image/png, image/jpeg, image/gif, image/webp"
            type="file"
            id={htmlFor}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
            onChange={async (e) => {
                if (e.target.files?.[0]) {
                    const reader = new FileReader()
                    reader.readAsDataURL(e.target.files[0])

                    const base64String = (await new Promise((resolve) => {
                        reader.onload = () => {
                            const base64String = (reader.result as string).split(',')[1]
                            resolve(base64String)
                        }
                    })) as string

                    const contentType = e.target.files[0].type as
                        | 'image/png'
                        | 'image/jpeg'
                        | 'image/gif'
                        | 'image/webp'

                    const filePath = await uploadSlide(base64String, contentType)

                    if (filePath) {
                        setSlide(`${process.env.NEXT_PUBLIC_CDN_HOST}/${filePath}`)
                    }
                }
            }}
        />
    )
}
