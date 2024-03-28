'use server'
import { buildFramePage } from '@/lib/sdk'
import satori from 'satori'
import type { Config, State } from '..'
import CoverView from '../views/Cover'

export default async function initial(config: Config, state: State) {
    const roboto = await fetch(
        'https://github.com/openmaptiles/fonts/raw/master/roboto/Roboto-Medium.ttf'
    ).then((res) => res.arrayBuffer())

    const reactSvg = await satori(CoverView(), {
        height: 400,
        width: 600,
        fonts: [
            {
                name: 'Roboto',
                data: roboto,
            },
        ],
    })

    return buildFramePage({
        buttons: [],
        image: 'data:image/svg+xml;base64,' + Buffer.from(reactSvg).toString('base64'),
        config: config,
        aspectRatio: '1.91:1',
        function: 'vote',
    })
}
