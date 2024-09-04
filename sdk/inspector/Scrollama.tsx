'use client'

import React, { useState, useMemo, useCallback, useRef, useEffect, type ReactNode } from 'react'
import { useInView } from 'react-intersection-observer'

type RootProps = {
    children: React.ReactNode
    offset?: number | string
    onStepEnter?: (step: {
        element: Element
        scrollamaId: string
        data: any
        entry: IntersectionObserverEntry
        direction: 'up' | 'down'
    }) => void
    onStepExit?: (step: {
        element: Element
        scrollamaId: string
        data: any
        entry: IntersectionObserverEntry
        direction: 'up' | 'down'
    }) => void
    onStepProgress?:
        | ((step: {
              progress: number
              scrollamaId: string
              data: any
              element: HTMLElement
              entry: IntersectionObserverEntry
              direction: 'up' | 'down'
          }) => void)
        | null
    threshold?: number
}

type StepProps = {
    children: React.ReactElement
    data: any
    handleSetLastScrollTop?: (scrollTop: number) => void
    lastScrollTop?: number
    onStepEnter?: (step: {
        element: HTMLElement
        scrollamaId: string
        data: any
        entry: IntersectionObserverEntry
        direction: 'up' | 'down'
    }) => void
    onStepExit?: (step: {
        element: HTMLElement
        scrollamaId: string
        data: any
        entry: IntersectionObserverEntry
        direction: 'up' | 'down'
    }) => void
    onStepProgress?:
        | ((step: {
              progress: number
              scrollamaId: string
              data: any
              element: HTMLElement
              entry: IntersectionObserverEntry
              direction: 'up' | 'down'
          }) => void)
        | null
    offset?: number
    scrollamaId?: string
    progressThreshold?: number[]
    innerHeight?: number
}

const isOffsetInPixels = (offset: string): boolean =>
    typeof offset === 'string' && offset.includes('px')

const createThreshold = (theta: number, height: number): number[] => {
    const count = Math.ceil(height / theta)
    const t: number[] = []
    const ratio = 1 / count
    for (let i = 0; i <= count; i += 1) {
        t.push(i * ratio)
    }
    return t
}

const Root = (props: RootProps): ReactNode => {
    const {
        children,
        offset = 0.3,
        onStepEnter = () => {},
        onStepExit = () => {},
        onStepProgress = null,
        threshold = 4,
    } = props
    const isOffsetDefinedInPixels = isOffsetInPixels(offset as string)
    const [lastScrollTop, setLastScrollTop] = useState(0)
    const [windowInnerHeight, setWindowInnerHeight] = useState<number | null>(null)

    const handleSetLastScrollTop = (scrollTop: number): void => {
        setLastScrollTop(scrollTop)
    }

    useEffect(() => {
        if (typeof window === 'undefined') return
        const handleWindowResize = (): void => {
            setWindowInnerHeight(window?.innerHeight)
        }
        if (isOffsetDefinedInPixels) {
            window?.addEventListener('resize', handleWindowResize)
            return () => {
                window?.removeEventListener('resize', handleWindowResize)
            }
        }
    }, [isOffsetDefinedInPixels])

    const isBrowser = typeof window !== 'undefined'
    const innerHeight = isBrowser ? windowInnerHeight || window?.innerHeight : 0

    const offsetValue = isOffsetDefinedInPixels
        ? +(offset as string).replace('px', '') / innerHeight
        : offset

    const progressThreshold = useMemo(
        () => (innerHeight > 0 ? createThreshold(threshold, innerHeight) : []),
        [innerHeight, threshold]
    )

    return (
        <>
            {React.Children.map(children, (child, i) => {
                if (React.isValidElement(child) && child.type === Step) {
                    return React.cloneElement(child, {
                        scrollamaId: `react-scrollama-${i}`,
                        offset: offsetValue,
                        onStepEnter,
                        onStepExit,
                        onStepProgress,
                        lastScrollTop,
                        handleSetLastScrollTop,
                        progressThreshold,
                        innerHeight,
                    })
                }
                throw new Error(
                    'Scrollama.Root only accepts Configuration.Section components as direct children'
                )
            })}
        </>
    )
}

const getRootMargin = (offset = 0) => {
    return `${-offset * 100}% 0px ${100 - offset * 100}% 0px`
}

/**
 * Calculate the root margin for the given direction and offset.
 * @param {Direction} direction The direction of the scroll.
 * @param {number} offset The offset value.
 * @param {React.MutableRefObject<HTMLElement | null>} node The react ref pointing to the element.
 * @param {number} innerHeight The inner height of the element.
 * @returns {string} The calculated root margin as a string in the format 'top right bottom left'.
 */
const useProgressRootMargin = (
    direction: 'up' | 'down',
    offset: number,
    node: React.MutableRefObject<HTMLElement | null>,
    innerHeight: number
): string => {
    if (!node.current) return '0px'
    const offsetHeight = node.current.offsetHeight / innerHeight
    if (direction === 'down')
        return `${(offsetHeight - offset) * 100}% 0px ${offset * 100 - 100}% 0px`
    return `-${offset * 100}% 0px ${offsetHeight * 100 - (100 - offset * 100)}% 0px`
}

const Step = (props: StepProps) => {
    const {
        children,
        data,
        handleSetLastScrollTop,
        lastScrollTop = 0,
        onStepEnter = () => {},
        onStepExit = () => {},
        onStepProgress = null,
        offset = 0,
        scrollamaId = 'react-scrollama',
        progressThreshold = [],
        innerHeight = 1,
    } = props

    const isBrowser = typeof window !== 'undefined'
    const scrollTop = isBrowser ? document.documentElement.scrollTop : 0
    const direction = lastScrollTop > scrollTop ? 'up' : 'down'

    const rootMargin = getRootMargin(offset)

    const ref = useRef<HTMLElement | null>(null)
    const [isIntersecting, setIsIntersecting] = useState(false)

    const { ref: inViewRef, entry } = useInView({
        rootMargin,
        threshold: 0,
    })

    const progressRootMargin = useProgressRootMargin(direction, offset, ref, innerHeight)

    const { ref: scrollProgressRef, entry: scrollProgressEntry } = useInView({
        rootMargin: progressRootMargin,
        threshold: progressThreshold,
    })

    const setRefs = useCallback(
        (node: HTMLElement) => {
            ref.current = node
            inViewRef(node)
            scrollProgressRef(node)
        },
        [inViewRef, scrollProgressRef]
    )

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        if (isIntersecting && scrollProgressEntry?.target) {
            const { height, top } = scrollProgressEntry.target.getBoundingClientRect()
            if (height && top) {
                const progress = Math.min(
                    1,
                    Math.max(0, (window.innerHeight * offset - top) / height)
                )
                onStepProgress?.({
                    progress,
                    scrollamaId,
                    data,
                    element: scrollProgressEntry.target as HTMLElement,
                    entry: scrollProgressEntry,
                    direction,
                })
            }
        }
    }, [scrollProgressEntry])

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        if (entry && !entry.isIntersecting && isIntersecting) {
            onStepExit({
                element: entry.target as HTMLElement,
                scrollamaId,
                data,
                entry,
                direction,
            })
            setIsIntersecting(false)
            handleSetLastScrollTop?.(scrollTop)
        } else if (entry?.isIntersecting && !isIntersecting) {
            setIsIntersecting(true)
            onStepEnter({
                element: entry.target as HTMLElement,
                scrollamaId,
                data,
                entry,
                direction,
            })
            handleSetLastScrollTop?.(scrollTop)
        }
    }, [entry, scrollTop])

    return React.cloneElement(React.Children.only(children), {
        'data-react-scrollama-id': scrollamaId,
        ref: setRefs,
        entry,
    })
}

const Scrollama = {
    Step,
    Root,
}

export default Scrollama
