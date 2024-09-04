import React, { type ReactNode, type ReactElement } from 'react'

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
    const validChildren = React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === Section) {
            const sectionId = `section-${child.props.title.toLowerCase().replace(/\s+/g, '-')}`

            return (
                <div id={sectionId} className="flex flex-col gap-2">
                    {child}
                </div>
            )
        }
        throw new Error(
            'Configuration.Root only accepts Configuration.Section components as direct children'
        )
    })

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-row gap-2 overflow-scroll">
                {validChildren.map((child) => {
                    return (
                        <a
                            key={child.props.children.props.title}
                            href={`#section-${child.props.children.props.title
                                .toLowerCase()
                                .replace(/\s+/g, '-')}`}
                            className="text-[#ffffff90] border border-[#ffffff30] rounded-xl p-1 px-3 hover:border-[#ffffff90]"
                        >
                            {child.props.children.props.title}
                        </a>
                    )
                })}
            </div>
            <div className="flex flex-col gap-5 max-md:gap-3">{validChildren}</div>
        </div>
    )
}

const Configuration = {
    Section,
    Root,
}

export default Configuration