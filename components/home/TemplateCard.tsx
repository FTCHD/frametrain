'use client'
import { createFrame } from '@/lib/actions'
import type templates from '@/templates'
import {
    AspectRatio,
    Card,
    CardContent,
    CardOverflow,
    Divider,
    IconButton,
    Typography,
} from '@mui/joy'
import type { StaticImageData } from 'next/image'
import NextImage from 'next/image'
import { useRouter } from 'next/navigation'
import { Plus } from 'react-feather'

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
        <Card variant="outlined" sx={{ width: 350 }}>
            <CardOverflow>
                <AspectRatio ratio="1.5">
                    <NextImage src={cover} alt={name} fill={true} objectPosition="center" />
                </AspectRatio>
                <IconButton
                    size="lg"
                    variant="solid"
                    color="danger"
                    sx={{
                        position: 'absolute',
                        zIndex: 2,
                        borderRadius: '50%',
                        right: '1rem',
                        bottom: 0,
                        transform: 'translateY(50%)',
                    }}
                    onClick={async () => {
                        const newFrame = await createFrame({
                            name: 'My Frame',
                            template: id as keyof typeof templates,
                        })

                        router.push('/frame/' + newFrame.id)
                    }}
                >
                    <Plus size={32} />
                </IconButton>
            </CardOverflow>
            <CardContent>
                <Typography level="title-lg">{name}</Typography>
            </CardContent>
            <CardContent
                sx={{
                    justifyContent: 'center',
                    alignItems: 'start',
                }}
            >
                <Typography>{description}</Typography>
            </CardContent>
            <CardOverflow variant="soft">
                <Divider inset="context" />
                <CardContent orientation="horizontal">
                    <Typography level="body-xs">Created by {creatorName}</Typography>
                </CardContent>
            </CardOverflow>
        </Card>
    )
}
