'use server'
import type { BuildFrameData, FrameActionPayload } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config } from '..'
import MonthView from '../views/Month'

export default async function month({
    config,
    body,
    params,
}: {
    body: FrameActionPayload
    config: Config
    params: any
}): Promise<BuildFrameData> {
    const fontSet = new Set(['Roboto'])
    const fonts: any[] = []

    if (config?.fontFamily) {
        fontSet.add(config.fontFamily)
    }

    for (const font of fontSet) {
        const loadedFont = await loadGoogleFontAllVariants(font)
        fonts.push(...loadedFont)
    }

    if ((config.events || []).length === 0) {
        throw new FrameError('No events available to schedule.')
    }

    const buttonIndex = body.untrustedData.buttonIndex
    const inputText = body.untrustedData.inputText
    let month = params?.month === undefined ? new Date().getMonth() : Number(params?.month)
    const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ]

    switch (buttonIndex) {
        case 2: {
            if (!inputText && params.month === undefined) {
                break
            }
            return {
                fonts,
                buttons: [
                    {
                        label: '⬅️',
                    },
                    {
                        label: 'Select',
                    },
                    {
                        label: '➡️',
                    },
                ],
                params: {
                    month,
                    date: params.date,
                },
                handler: 'day',
            }
        }

        default: {
            if (buttonIndex === 1) {
                month =
                    params.month === undefined ? month : month === 0 ? months.length - 1 : month - 1
            } else {
                month =
                    params.month === undefined ? month : month === months.length - 1 ? 0 : month + 1
            }
            break
        }
    }

    return {
        buttons: config.events.map((event) => ({
            label: event.formattedDuration,
        })),
        fonts: fonts,
        component: MonthView(config),
        handler: 'month',
        inputText: 'Enter month as January or 1',
    }
}
