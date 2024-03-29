'use server'
import { dimensionsForRatio } from '@/lib/constants'
import type { FrameActionPayload, FrameValidatedActionPayload } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/lib/fonts'
import { buildFramePage } from '@/lib/sdk'
import satori from 'satori'
import type { Config, State } from '..'
import ResultsView from '../views/Results'

export default async function vote(
    body: FrameActionPayload | FrameValidatedActionPayload,
    config: Config,
    state: State,
    params: any
) {
    // biome-ignore lint/style/useConst: <>
    let newState = state

    const voter = body.untrustedData.fid

    newState = {
        votesForId: {
            ...state.votesForId,
            [voter]: state.votesForId[voter] ? state.votesForId[voter] + 1 : 1,
        },
        votesForOption: {
            ...state.votesForOption,
            [body.untrustedData.buttonIndex]: state?.votesForOption?.[
                body.untrustedData.buttonIndex
            ]
                ? state.votesForOption[body.untrustedData.buttonIndex] + 1
                : 1,
        },
    }
    console.log(voter)

    console.log(state)
    console.log(newState)

    const totalVotes = Object.keys(newState.votesForOption).reduce(
        (total: number, option: string) => total + newState.votesForOption[option],
        0
    )

    const percentageForEachOption: Record<string, number> = {}

    for (const [key, value] of Object.entries(newState.votesForOption)) {
        percentageForEachOption[key as string] = (value / totalVotes) * 100
    }

    // sort options by percentage
    const sortedOptions = config.options.sort(
        (a, b) => percentageForEachOption[b.index] - percentageForEachOption[a.index]
    )

    const roboto = await loadGoogleFontAllVariants('Roboto')

    const reactSvg = await satori(
        ResultsView(
            config?.question,
            sortedOptions,
            totalVotes,
            percentageForEachOption,
            newState.votesForOption
        ),
        {
            ...dimensionsForRatio['1.91/1'],
            fonts: roboto,
        }
    )

    return {
        frame: await buildFramePage({
            buttons: [
                { label: 'Back' },
                { label: 'Create Poll', action: 'link', target: 'https://frametra.in' },
            ],
            image: 'data:image/svg+xml;base64,' + Buffer.from(reactSvg).toString('base64'),
            config: config,
            aspectRatio: '1.91:1',
            function: 'results',
        }),
        state: newState,
    }
}
