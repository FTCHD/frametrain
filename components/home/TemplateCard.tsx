'use client'
import { createFrame } from '@/lib/actions'
import type templates from '@/templates'
import type { StaticImageData } from 'next/image'
import NextImage from 'next/image'
import { useRouter } from 'next/navigation'
import { Plus } from 'react-feather'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'

export const runtime = 'edge'

export default function TemplateCard({
    id,
    template,
}: {
    id: string
    template: {
        name: string
        description: string
        creatorName: number
        cover: StaticImageData
    }
}) {
    const router = useRouter()

    const { name, description, creatorName, cover } = template

    return (
        <>
            <Card className="w-[350px] h-[400px]  rounded">
                <CardHeader className=" p-0 relative ">
                    <NextImage
                        src={cover}
                        alt={name}
                        className="object-cover rounded h-64 "
                        objectPosition="center "
                    />
                    <Button
                        className="rounded-full h-12 w-12 absolute right-4 -bottom-12 transform -translate-y-1/2 "
                        onClick={async () => {
                            const newFrame = await createFrame({
                                name: 'My Frame',
                                template: id as keyof typeof templates,
                            })

                            router.push('/frame/' + newFrame.id)
                        }}
                        variant="outline"
                    >
                        <Plus size={32} />
                    </Button>
                </CardHeader>
                <CardContent className="flex flex-col items-start space-y-2 h-20 ">
                    <CardTitle className="mt-2 text-lg">{name}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardContent>
                <hr className=" w-full mt-7 border-gray-800" />
                <CardFooter>
                    <p>Created by {creatorName}</p>
                </CardFooter>
            </Card>
        </>
    )
}
