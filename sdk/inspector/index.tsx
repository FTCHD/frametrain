'use client'

import { useScrollSection, useScrollSectionContext } from '@/components/editor/useScrollSection'
import { cn } from '@/lib/shadcn'
import {} from 'jotai'
import React, { type ReactElement, type ReactNode } from 'react'

interface SectionProps {
    title: string
    children: ReactNode
    description?: string
}

function Section({ title, children, description }: SectionProps): ReactElement {
	const { ref } = useScrollSection(title)
	
    return (
        <div className="flex flex-col gap-2" ref={ref}>
            <h2 className="text-2xl font-semibold max-md:text-lg">{title}</h2>
            <div className="flex flex-col gap-2 w-full">
                {description && (
                    <p className="text-sm text-muted-foreground max-w-[80%] max-md:text-xs">
                        {description}
                    </p>
                )}
                {children}
            </div>
        </div>
    )
}

interface RootProps {
    children: ReactNode
}

function Root(props: RootProps): ReactElement {
	const { currentSection } = useScrollSectionContext()

    const children = props.children as ReactElement<SectionProps> | ReactElement<SectionProps>[]

    const validChildren = React.Children.map(children, (child) => {
        if (child && React.isValidElement(child) && child.type === Section) {
            return (
                <div id={child.props.title} className="flex flex-col gap-2">
                    {child}
                </div>
            )
        }
        if (!child) {
            return
        }
        throw new Error(
            'Configuration.Root only accepts Configuration.Section components as direct children'
        )
    })

    return (
        <div className="flex flex-col gap-2 w-full h-full">
            {validChildren.length > 1 && (
                <div className="flex overflow-scroll gap-2 pt-3 pl-4 h-20 max-md:h-14">
                    {validChildren.map((child) => {
                        const sectionId = child.props.id
                        return (
                            <a
                                key={sectionId}
                                href={`#${sectionId}`}
                                className={cn(
                                    'whitespace-nowrap h-full border border-[#ffffff30] rounded-xl p-2 px-4 hover:border-[#ffffff90] text-[#ffffff90]',
                                    currentSection === sectionId && 'text-white bg-border'
                                )}
                            >
                                {child.props.children.props.title}
                            </a>
                        )
                    })}
                </div>
            )}
            <div className="flex px-4 overflow-y-scroll max-h-[calc(100vh-200px)] flex-col gap-5 max-md:gap-3">
                {validChildren}
            </div>
        </div>
    )
}

const Configuration = {
    Section,
    Root,
}

export { Configuration }
