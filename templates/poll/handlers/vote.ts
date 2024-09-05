'use server'
import type { BuildFrameData, FramePayloadValidated } from '@/lib/farcaster'
import { runGatingChecks } from '@/lib/gating'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, Storage } from '..'
import ResultsView from '../views/Results'

export default async function vote({
    body,
    config,
    storage,
}: {
    body: FramePayloadValidated
    config: Config
    storage: Storage
}): Promise<BuildFrameData> {
    const viewer = body.interactor
    const voter = viewer.fid.toString()
    const buttonIndex = body.tapped_button.index as number
    const username = body.interactor.username

    const pastIndex =
        storage.votesForId?.[voter]?.option || (storage.votesForId?.[voter] as unknown as number)

    let newStorage = storage

    if (config.enableGating) {
        await runGatingChecks(body, config.gating)
    }

    if (buttonIndex !== pastIndex) {
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
                [voter]: {
                    option: buttonIndex,
                    username,
                    timestamp: Date.now(),
                },
            },
            votesForOption: {
                ...(storage.votesForOption ?? {}),
                [buttonIndex]: (storage?.votesForOption?.[buttonIndex] ?? 0) + 1,
                ...(revertPastVote ?? {}),
            },
            totalVotes: (storage?.totalVotes ?? 0) + (revertPastVote ? 0 : 1),
        })
    }

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
