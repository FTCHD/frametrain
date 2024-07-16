'use client'

import type { frameTable } from '@/db/schema'
import type { InferSelectModel } from 'drizzle-orm'

export default function ProjectCard({ frame }: { frame: InferSelectModel<typeof frameTable> }) {
    const { id, name, template, currentMonthCalls } = frame
    return (
        <a
            href={`/frame/${id}`}
            style={{ textDecoration: 'none' }}
            className="w-[330px] h-[130px] bg-[#ffffff09] p-4  border-[#32383E] border rounded-lg hover:drop-shadow-2xl hover:bg-[#ffffff1a] transition-all duration-300"
            key={id}
        >
            <div className="flex flex-row gap-5 justify-center w-full h-full">
                <div className="w-[95px] h-[95px]">
                    <img
                        src={`${process.env.NEXT_PUBLIC_CDN_HOST}/frames/${id}/preview.png`}
                        alt={name}
                        className="object-cover object-center rounded-[50px] padding-0 space-0 h-full w-full"
                        onError={(e) => {
                            e.currentTarget.srcset = ''
                            e.currentTarget.src =
                                'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiB2aWV3Qm94PSIwIDAgMTI0IDEyNCIgZmlsbD0ibm9uZSI+CjxyZWN0IHdpZHRoPSIxMjQiIGhlaWdodD0iMTI0IiByeD0iMjQiIGZpbGw9IiNGOTczMTYiLz4KPHBhdGggZD0iTTE5LjM3NSAzNi43ODE4VjEwMC42MjVDMTkuMzc1IDEwMi44MzQgMjEuMTY1OSAxMDQuNjI1IDIzLjM3NSAxMDQuNjI1SDg3LjIxODFDOTAuNzgxOCAxMDQuNjI1IDkyLjU2NjQgMTAwLjMxNiA5MC4wNDY2IDk3Ljc5NjZMMjYuMjAzNCAzMy45NTM0QzIzLjY4MzYgMzEuNDMzNiAxOS4zNzUgMzMuMjE4MiAxOS4zNzUgMzYuNzgxOFoiIGZpbGw9IndoaXRlIi8+CjxjaXJjbGUgY3g9IjYzLjIxMDkiIGN5PSIzNy41MzkxIiByPSIxOC4xNjQxIiBmaWxsPSJibGFjayIvPgo8cmVjdCBvcGFjaXR5PSIwLjQiIHg9IjgxLjEzMjgiIHk9IjgwLjcxOTgiIHdpZHRoPSIxNy41Njg3IiBoZWlnaHQ9IjE3LjM4NzYiIHJ4PSI0IiB0cmFuc2Zvcm09InJvdGF0ZSgtNDUgODEuMTMyOCA4MC43MTk4KSIgZmlsbD0iI0ZEQkE3NCIvPgo8L3N2Zz4='
                            e.currentTarget.style.objectFit = 'contain'
                        }}
                    />
                </div>
                <div className="flex flex-col gap-4 items-start justify-between grow">
                    <h1 className="font-bold text-lg">{name}</h1>
                    <div className="flex flex-row  gap-2 w-full">
                        <div className="px-4 py-1 text-sm font-medium rounded-full text-[#c7dff7] bg-[#12467B]">
                            {template[0].toUpperCase() + template.slice(1)}
                        </div>
                        <div className="px-4 py-1 text-sm font-medium rounded-full text-[#c7dff7] bg-[#12467B]">
                            {currentMonthCalls === 0 ? 'No taps' : `${currentMonthCalls} taps`}
                        </div>
                    </div>
                </div>
            </div>
        </a>
    )
}
