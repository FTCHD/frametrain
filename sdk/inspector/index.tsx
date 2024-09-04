'use client'

import { cn } from '@/lib/shadcn'
import React, { type ReactNode, type ReactElement, useState } from 'react'
import Scrollama from './Scrollama'

interface SectionProps {
    title: string
    children: ReactNode
}

function Section({ title, children }: SectionProps): ReactElement {
    return (
        <>
            <h2 className="text-2xl font-semibold max-md:text-lg">{title}</h2>
            <div className="flex flex-col gap-2">{children}</div>
        </>
    )
}

interface RootProps {
    children: ReactElement<SectionProps> | ReactElement<SectionProps>[]
}

function Root({ children }: RootProps): ReactElement {
    const [currentSection, setCurrentSection] = useState<{
        sectionId: string
        title: string
    } | null>(null)

    // This callback fires when a Step hits the offset threshold. It receives the
    // data prop of the step, which in this demo stores the index of the step.
    const onStepEnter = ({
        data,
    }: {
        data: {
            sectionId: string
            title: string
            idx: number
        }
        direction: 'up' | 'down'
    }) => {
        setCurrentSection({
            sectionId: data.sectionId,
            title: data.title,
        })
    }

    const onStepExit = ({
        data,
        direction,
    }: {
        data: {
            sectionId: string
            title: string
            idx: number
        }
        direction: 'up' | 'down'
    }) => {
        if (data.idx === 0 && direction === 'up') {
            setCurrentSection(null)
        }
    }

    const validChildren = React.Children.map(children, (child, idx) => {
        if (React.isValidElement(child) && child.type === Section) {
            const sectionId = `section-${child.props.title.toLowerCase().replace(/\s+/g, '-')}`
            return (
                <Scrollama.Step data={{ sectionId, title: child.props.title, idx }} key={sectionId}>
                    <div id={sectionId} className="flex flex-col gap-2">
                        {child}
                    </div>
                </Scrollama.Step>
            )
        }
        throw new Error(
            'Configuration.Root only accepts Configuration.Section components as direct children'
        )
    })

    return (
        <div className="flex flex-col gap-4 h-full w-full">
            <div className="flex flex-row gap-2 overflow-scroll">
                {validChildren.map((child) => {
                    const sectionId = `${child.props.data.sectionId}`
                    return (
                        <a
                            key={sectionId}
                            href={`#${sectionId}`}
                            className={cn(
                                'w-full sticky top-0 z-10 border border-[#ffffff30] rounded-xl p-1 px-3 hover:border-[#ffffff90] text-[#ffffff90]',
                                currentSection?.sectionId === sectionId && 'text-white bg-border'
                            )}
                            onClick={() => {
                                if (currentSection?.sectionId === sectionId) return
                                setCurrentSection({
                                    sectionId,
                                    title: child.props.data.title,
                                })
                            }}
                        >
                            {child.props.data.title}
                        </a>
                    )
                })}
            </div>
            <div className="overflow-y-scroll flex flex-col gap-5 max-md:gap-3">
                <Scrollama.Root offset={0.3} onStepEnter={onStepEnter} onStepExit={onStepExit}>
                    {validChildren}
                </Scrollama.Root>
            </div>
        </div>
    )
}

const Configuration = {
    Section,
    Root,
}

export { Configuration }