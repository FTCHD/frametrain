'use server'
import type { BuildFrameData, FrameActionPayload } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, Storage } from '..'
import ResultsView from '../views/Results'

export default async function vote({
    body,
    config,
    storage,
}: {
    body: FrameActionPayload
    config: Config
    storage: Storage
}): Promise<BuildFrameData> {
    const voter = body.untrustedData.fid.toString()
    const buttonIndex = body.untrustedData.buttonIndex
    const pastIndex = storage.votesForId?.[voter]

    let newStorage = storage

    if (buttonIndex !== pastIndex) {
        // console.log('pastIndex', pastIndex)
        const revertPastVote = pastIndex
            ? {
                  [pastIndex]:
                      storage.votesForOption?.[pastIndex] > 1
                          ? storage.votesForOption?.[pastIndex] - 1
                          : 0,
              }
            : null

        newStorage = Object.assign(storage, {
            votesForId: {
                ...(storage.votesForId ?? {}),
                [voter]: buttonIndex,
            },
            votesForOption: {
                ...(storage.votesForOption ?? {}),
                [buttonIndex]: (storage?.votesForOption?.[buttonIndex] ?? 0) + 1,
                ...(revertPastVote ?? {}),
            },
            totalVotes: (storage?.totalVotes ?? 0) + (revertPastVote ? 0 : 1),
        })
    }

    // console.log(voter)
    // console.log(storage)
    // console.log(newStorage)

    const totalVotes = newStorage.totalVotes

    const percentageForEachOption = Object.fromEntries(
        Object.entries(newStorage.votesForOption).map(([key, value]) => [
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
        storage: newStorage,
        fonts: roboto,
        component: ResultsView(
            config?.question,
            sortedOptions,
            totalVotes,
            percentageForEachOption,
            newStorage.votesForOption,
            colors
        ),
        handler: 'results',
    }
}
