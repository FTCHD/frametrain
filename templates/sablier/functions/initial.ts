'use server'
import { loadGoogleFontAllVariants } from '@/lib/fonts'
import { buildFramePage } from '@/lib/sdk'
import satori from 'satori'
import type { Config, State } from '..'
import { getStreamData } from '../utils/actions'
import CoverView from '../views/Cover'

export default async function initial(config: Config, state: State) {
    const fonts = await loadGoogleFontAllVariants('Workbench')

    console.log('config', config)

    const data = Object.assign({}, await getStreamData(config.streamId), { shape: config.shape })

    console.log('data', data)

    console.log('fonts', fonts)

    const reactSvg = await satori(CoverView(data), {
        height: 302,
        width: 540,
        fonts: fonts,
    })

    return buildFramePage({
        buttons: [
            {
                label: 'Summary',
            },
            {
                label: 'Token',
            },
            {
                label: 'History',
            },
            {
                label: 'Create',
                action: 'link',
                target: 'https://sablier.com/create',
            },
        ],
        image: 'data:image/svg+xml;base64,' + Buffer.from(reactSvg).toString('base64'),
        config: config,
        aspectRatio: '1.91:1',
        inputText: 'WHAZZZUP',
        function: 'page',
    })
}
