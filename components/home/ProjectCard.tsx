'use client'
// import { AspectRatio, Card, CardContent, Chip, Link, Typography } from '@mui/joy'
// import { Card } from 'card';
import NextImage from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '../ui/card'
export default function ProjectCard({
    frame,
}: { frame: { id: string; name: string; preview: string; currentMonthCalls: number } }) {
    const { id, name, preview, currentMonthCalls } = frame
    return (
        <Card
            className="flex flex-row items-center   hover:border-ring hover:drop-shadow-md w-64"
            key={id}
        >
            <CardHeader className="p-2 w-24">
                <NextImage
                    src={`data:image/svg+xml;base64,${preview}`}
                    alt={name}
                    width={320}
                    height={180}
                    objectFit="cover"
                />
            </CardHeader>
            <Link href={`/frame/${id}`}>
                <CardContent className="space-y-4 items-center">
                    <h1 className="font-medium">{name}</h1>
                    <div className=" bg-border font-medium text-xs px-1 rounded-full border border-border">
                        {currentMonthCalls === 0 ? 'Not used yet' : `${currentMonthCalls} calls`}
                    </div>
                </CardContent>
            </Link>
        </Card>
    )
}
