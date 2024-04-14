'use client'
import NextImage from 'next/image'
import NextLink from 'next/link'

export default function ProjectCard({
    frame,
}: { frame: { id: string; name: string; preview: string; currentMonthCalls: number } }) {
    const { id, name, preview, currentMonthCalls } = frame
    return (
        <NextLink
            href={`/frame/${id}`}
            style={{ textDecoration: 'none' }}
            className="w-[320px] bg-[#0B0D0E] p-5  border-[#32383E] border rounded-lg hover:drop-shadow-2xl"
            key={id}
        >
            <div className="flex flex-row gap-5 justify-center w-full h-full">
                <NextImage
                    src={`data:image/png;base64,${preview}`}
                    alt={name}
                    width={90}
                    height={90}
                    className="object-cover rounded-md"
                />
                <div className="flex flex-col gap-4 items-start w-full h-full">
                    <h1 className="font-medium">{name}</h1>
                    <div className="px-2 py-1 text-xs font-medium rounded-full text-[#c7dff7] border border-[#12467B]">
                        {currentMonthCalls === 0 ? 'Not used yet' : `${currentMonthCalls} calls`}
                    </div>
                </div>
            </div>
        </NextLink>
    )
}
