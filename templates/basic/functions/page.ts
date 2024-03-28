'use server'
import type { FrameActionPayload } from '@/lib/farcaster'
import { buildFramePage } from '@/lib/sdk'
import type { ReactNode } from 'react'
import satori from 'satori'
import type { Config, State } from '..'

export default async function page(
    body: FrameActionPayload,
    config: Config,
    state: State,
    params: any
) {
    const frameImage = 'https://placehold.co/1920x1005?text=Hello+World'

    const r = await satori(
        {
            type: 'div',
            props: {
                children: 'hello, world',
                style: { color: 'black' },
            },
        } as ReactNode,
        {
            height: 1000,
            width: 1000,
            fonts: [],
        }
    )

    return {
        frame: await buildFramePage({
            buttons: [
                {
                    label: 'Green',
                },
                {
                    label: 'Purple',
                },
                {
                    label: 'Red',
                },
                {
                    label: 'Blue',
                },
            ],
            image: r,
            aspectRatio: '1.91:1',
            config: config,
            function: 'results',
            params: { currentPage: 1 },
        }),
        state: state,
    }
}
