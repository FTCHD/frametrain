'use client'
import { AspectRatio, Card, CardContent, Chip, Link, Typography } from '@mui/joy'
import NextImage from 'next/image'
import NextLink from 'next/link'

export default function ProjectCard({
    frame,
}: { frame: { id: string; name: string; preview: string; currentMonthCalls: number } }) {
    const { id, name, preview, currentMonthCalls } = frame
    return (
        <Card
            key={id}
            variant="outlined"
            orientation="horizontal"
            sx={{
                width: 320,
                '&:hover': {
                    boxShadow: 'md',
                    borderColor: 'neutral.outlinedHoverBorder',
                },
            }}
        >
            <AspectRatio ratio="1" sx={{ width: 90 }}>
                <NextImage
                    src={`data:image/svg+xml;base64,${preview}`}
                    alt={name}
                    fill={true}
                    objectFit="cover"
                />
            </AspectRatio>
            <CardContent
                sx={{
                    gap: 2,
                }}
            >
                <Link
                    overlay={true}
                    href={`/frame/${id}`}
                    underline="none"
                    sx={{ color: 'text.tertiary', textDecoration: 'none' }}
                    component={NextLink}
                >
                    <Typography level="title-lg" id="card-description">
                        {name}
                    </Typography>
                </Link>

                <Chip variant="outlined" color="primary" size="sm" sx={{ pointerEvents: 'none' }}>
                    {currentMonthCalls === 0 ? 'Not used yet' : `${currentMonthCalls} calls`}
                </Chip>
            </CardContent>
        </Card>
    )
}
