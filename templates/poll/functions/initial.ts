'use server'
import { dimensionsForRatio } from '@/lib/constants'
import { loadGoogleFontAllVariants } from '@/lib/fonts'
import { buildFramePage } from '@/lib/sdk'
import satori from 'satori'
import type { Config, State } from '..'
import VoteView from '../views/Vote'

export default async function initial(config: Config, state: State) {
    const roboto = await loadGoogleFontAllVariants('Roboto')

    const reactSvg = await satori(VoteView(config?.question), {
        ...dimensionsForRatio['1.91/1'],
        fonts: roboto,
    })

    return buildFramePage({
        buttons: config?.options?.map((option) => ({
            label: option.buttonLabel,
        })),
        image: 'data:image/svg+xml;base64,' + Buffer.from(reactSvg).toString('base64'),
        config: config,
        aspectRatio: '1.91:1',
        function: 'vote',
    })
}
