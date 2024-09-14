'use client'
import {
    type ReactNode,
    createContext,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'

const ScrollSectionContext = createContext<{
    updateSection: (id: string, element: HTMLDivElement) => void
    currentSection: string | null
}>({
    updateSection: () => {},
    currentSection: null,
})

export const useScrollSectionContext = () => useContext(ScrollSectionContext)

export function ScrollSectionProvider({
    children,
}: {
    children: ReactNode
}) {
    const intersectionObserver = useRef<IntersectionObserver | null>(null)
    const sectionElements = useRef<Record<string, HTMLDivElement>>({})
    const [intersectingSections, setIntersectingSections] = useState<string[]>([])
    const [lastIntersectedSection, setLastIntersectedSection] = useState<string | null>(null)

    const currentSection = useMemo(() => {
        if (intersectingSections.length) {
            return intersectingSections[0]
        }

        return lastIntersectedSection
    }, [intersectingSections, lastIntersectedSection])

    const updateSection = (id: string, element: HTMLDivElement) => {
        if (sectionElements.current[id] === element) {
            return
        }

        if (sectionElements.current[id]) {
            intersectionObserver.current?.unobserve(sectionElements.current[id])
        }

        sectionElements.current[id] = element
        intersectionObserver.current?.observe(element)
    }

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                setIntersectingSections((sections) => {
                    const entriesId = entries
                        .map(({ isIntersecting, target }) => ({
                            isIntersecting,
                            id: Object.entries(sectionElements.current).find(
                                ([, element]) => element === target
                            )?.[0],
                        }))
                        .filter((entry) => entry.id) as { id: string; isIntersecting: boolean }[]

                    const newIntersections = entriesId
                        .filter((entry) => !sections.includes(entry.id) && entry.isIntersecting)
                        .map((entry) => entry.id)

                    const notIntersecting = entriesId
                        .filter((entry) => !entry.isIntersecting)
                        .map((entry) => entry.id)

                    const newSections = sections
                        .filter((section) => !notIntersecting.includes(section))
                        .concat(newIntersections)

                    newSections.sort((first, second) => {
                        const firstElement = sectionElements.current[first]
                        const secondElement = sectionElements.current[second]

                        if (!firstElement || !secondElement) {
                            return 0
                        }

                        return (
                            firstElement.getBoundingClientRect().top -
                            secondElement.getBoundingClientRect().top
                        )
                    })

                    if (newSections.length) {
                        setLastIntersectedSection(newSections[0])
                    }

                    return newSections
                })
            },
            {
                rootMargin: '-140px 0px -40% 0px',
            }
        )

        for (const element of Object.values(sectionElements.current)) {
            observer.observe(element)
        }
    }, [])

    return (
        <ScrollSectionContext.Provider
            value={{
                updateSection,
                currentSection,
            }}
        >
            {children}
        </ScrollSectionContext.Provider>
    )
}

export const useScrollSection = (id?: string) => {
    const { updateSection } = useScrollSectionContext()
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (id && ref.current) {
            updateSection(id, ref.current)
        }
    }, [id, updateSection])

    return {
        ref,
    }
}

