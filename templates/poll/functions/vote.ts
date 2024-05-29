'use server'
import type {
    BuildFrameData,
    FrameActionPayload,
    FrameValidatedActionPayload,
} from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, State } from '..'
import ResultsView from '../views/Results'

export default async function vote(
    body: FrameActionPayload | FrameValidatedActionPayload,
    config: Config,
    state: State,
    params: any
): Promise<BuildFrameData> {
    const voter = body.untrustedData.fid.toString()
    const buttonIndex = body.untrustedData.buttonIndex
    const pastIndex = state.votesForId?.[voter]

    let newState = state

    if (buttonIndex !== pastIndex) {
        // console.log('pastIndex', pastIndex)
        const revertPastVote = pastIndex
            ? {
                  [pastIndex]:
                      state.votesForOption?.[pastIndex] > 1
                          ? state.votesForOption?.[pastIndex] - 1
                          : 0,
              }
            : null

        newState = Object.assign(state, {
            votesForId: {
                ...(state.votesForId ?? {}),
                [voter]: buttonIndex,
            },
            votesForOption: {
                ...(state.votesForOption ?? {}),
                [buttonIndex]: (state?.votesForOption?.[buttonIndex] ?? 0) + 1,
                ...(revertPastVote ?? {}),
            },
            totalVotes: (state?.totalVotes ?? 0) + (revertPastVote ? 0 : 1),
        })
    }

    // console.log(voter)
    // console.log(state)
    // console.log(newState)

    const totalVotes = newState.totalVotes

    const percentageForEachOption = Object.fromEntries(
        Object.entries(newState.votesForOption).map(([key, value]) => [
            key,
            (value / totalVotes) * 100,
        ]) as [string, number][]
    ) as Record<string, number>

    // sort options by percentage
    const sortedOptions = config.options.sort(
        (a, b) => percentageForEachOption[b.index] - percentageForEachOption[a.index]
    )

    const roboto = await loadGoogleFontAllVariants('Roboto')

    const colors = {
        background: config?.background,
        textColor: config?.textColor,
        barColor: config?.barColor,
    }

    return {
        buttons: [
            { label: '←' },
            { label: 'Create Poll', action: 'link', target: 'https://frametra.in' },
        ],
        aspectRatio: '1.91:1',
        state: newState,
        fonts: roboto,
        component: ResultsView(
            config?.question,
            sortedOptions,
            totalVotes,
            percentageForEachOption,
            newState.votesForOption,
            colors
        ),
        functionName: 'results',
    }
}
