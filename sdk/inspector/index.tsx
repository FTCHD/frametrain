'use client'

import { cn } from '@/lib/shadcn'
import { atom, useAtom } from 'jotai'
import React, { type ReactElement, type ReactNode } from 'react'
import { useInView } from 'react-intersection-observer'

interface SectionProps {
    title: string
    children: ReactNode
    description?: string
}

interface InspectorConfigAtomOptions {
    sectionId: string
    clicked: boolean
}

const inspectorConfigAtom = atom<InspectorConfigAtomOptions>({
    sectionId: '',
    clicked: false,
})

function Section({ title, children, description }: SectionProps): ReactElement {
    const [config, setConfig] = useAtom(inspectorConfigAtom)
    const { ref: inViewRef } = useInView({
        rootMargin: '-10% 0px -60% 0px',
        onChange(inView) {
            const sectionId = title.toLowerCase().replace(/\s+/g, '-')
            if (inView && config.sectionId === sectionId && config.clicked) return
            if (inView) {
                setConfig({
                    sectionId: `section-${sectionId}`,
                    clicked: false,
                })
            }
        },
    })

    return (
        <div ref={inViewRef} className="flex flex-col gap-2">
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
    const [config, setConfig] = useAtom(inspectorConfigAtom)

    // This callback fires when a Step hits the offset threshold. It receives the
    // data prop of the step, which in this demo stores the index of the step.

    const children = props.children as ReactElement<SectionProps> | ReactElement<SectionProps>[]

    const validChildren = React.Children.map(children, (child) => {
        if (child && React.isValidElement(child) && child.type === Section) {
            const sectionId = `section-${child.props.title.toLowerCase().replace(/\s+/g, '-')}`
            return (
                <div id={sectionId} className="flex flex-col gap-2">
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
        <div className="flex flex-col gap-10 h-full w-full">
            {validChildren.length > 1 && (
                <div className="hidden gap-2 overflow-scroll md:flex">
                    {validChildren.map((child) => {
                        const sectionId = `${child.props.id}`
                        return (
                            <a
                                key={sectionId}
                                href={`#${sectionId}`}
                                className={cn(
                                    'whitespace-nowrap w-full sticky top-0 z-10 border border-[#ffffff30] rounded-xl p-2 px-3 hover:border-[#ffffff90] text-[#ffffff90]',
                                    config?.sectionId === sectionId && 'text-white bg-border'
                                )}
                                onClick={() => {
                                    if (config?.sectionId === sectionId) return

                                    setConfig({ sectionId, clicked: true })
                                }}
                            >
                                {child.props.children.props.title}
                            </a>
                        )
                    })}
                </div>
            )}
            <div className="overflow-y-scroll flex flex-col gap-5 max-md:gap-3">
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
