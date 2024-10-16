'use client'

import { useScrollSection, useScrollSectionContext } from '@/components/editor/useScrollSection'
import { cn } from '@/lib/shadcn'
import {} from 'jotai'
import React, { useEffect, useMemo, useRef, type ReactElement, type ReactNode } from 'react'

interface SectionProps {
    title: string
    children: ReactNode
    description?: string
}

function Section({ title, children, description }: SectionProps): ReactElement {
	const { ref } = useScrollSection(title)
	
    return (
        <div className="flex flex-col gap-2" ref={ref}>
            <div className="flex flex-col gap-1 w-full">
                <h2 className="text-xl font-semibold max-md:text-base">{title}</h2>
                {description && (
                    <p className="text-sm text-muted-foreground max-w-[80%] max-md:text-xs">
                        {description}
                    </p>
                )}
            </div>
            {children}
        </div>
    )
}

function Root(props: {
    children: ReactNode
}): ReactElement {
    const { currentSection } = useScrollSectionContext()
    const sectionsContainerRef = useRef<HTMLDivElement>(null)

    const children = props.children as ReactElement<SectionProps> | ReactElement<SectionProps>[]

    const validChildren = useMemo(() => {
        return React.Children.map(children, (child) => {
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
    }, [children])

    useEffect(() => {
        if (sectionsContainerRef.current && currentSection) {
            const container = sectionsContainerRef.current
            const activeElement = container.querySelector(`a[href="#${currentSection}"]`)

            if (activeElement) {
                const containerRect = container.getBoundingClientRect()
                const activeElementRect = activeElement.getBoundingClientRect()

                const isFullyVisible =
                    activeElementRect.left >= containerRect.left &&
                    activeElementRect.right <= containerRect.right

                if (!isFullyVisible) {
                    const scrollLeft =
                        activeElementRect.left -
                        containerRect.left +
                        container.scrollLeft -
                        (containerRect.width - activeElementRect.width) / 2
                    container.scrollTo({
                        left: scrollLeft,
                        behavior: 'smooth',
                    })
                }
            }
        }
    }, [currentSection])

    return (
        <div className="flex flex-col gap-2 w-full h-full">
            {validChildren.length > 1 && (
                <div
                    id="sections"
                    ref={sectionsContainerRef}
                    className={'flex overflow-scroll gap-2 p-4 pb-0'}
                >
                    {validChildren.map((child) => {
                        const sectionId = child.props.id
                        return (
                            <a
                                key={sectionId}
                                href={`#${sectionId}`}
                                className={cn(
                                    'border border-[#ffffff30] rounded-xl p-2 px-4 text-slate-300',
                                    'max-md:text-xs max-md:p-1 max-md:px-2',
                                    'hover:border-[#ffffff90]',
                                    currentSection === sectionId && 'text-white bg-border'
                                )}
                            >
                                {child.props.children.props.title}
                            </a>
                        )
                    })}
                </div>
            )}
            <div className="flex px-4 pb-0 overflow-y-scroll max-h-[calc(100vh-180px)] flex-col gap-5 max-md:gap-3 max-md:pb-14">
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
