import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { fieldTypes, Storage } from '.'
import dayjs from 'dayjs'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'

dayjs.extend(LocalizedFormat)
dayjs.extend(advancedFormat)

export const humanizeTimestamp = (ts?: number) => dayjs(ts).format('dddd, MMMM Do @ LT')

export function getIndexForFid(fid: number | string, storage: Storage): number {
    let index: number = -1
    storage.data?.find((record, i) => {
        if (record.fid === fid) {
            index = i
        }
    })
    return index
}

export function validateField(
    value: any,
    type: 'text' | 'number' | 'email' | 'phone' | 'address'
): { isValid: boolean; errors: string[] } {
    if (value.trim().length == 0) {
        return { isValid: true, errors: [] }
    }

    let isValid = true
    const errors: string[] = []

    switch (type) {
        case 'text': {
            isValid = typeof value === 'string' && value.trim().length > 0
            break
        }

        case 'number': {
            isValid = !(isNaN(value) || isNaN(Number.parseFloat(value)))
            break
        }

        case 'email': {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            isValid = typeof value === 'string' && emailRegex.test(value)
            break
        }

        case 'phone': {
            const phoneRegex = /^\+?[1-9]\d{1,14}$/
            isValid = typeof value === 'string' && phoneRegex.test(value)
            break
        }

        case 'address': {
            isValid = typeof value === 'string' && value.trim().length > 0
            break
        }

        default:
            break
    }

    return { isValid, errors }
}

export async function loadFontsAndtextElements(field: fieldTypes) {
    const fontSet = new Set(['Roboto'])
    const fonts: any[] = []
    const title = {
        text: field.fieldName,
        ...field.fieldNameStyle,
    }
    const subtitle = {
        text: field.fieldDescription,
        ...field.fieldDescriptionStyle,
    }
    const bottomMessage = {
        text: `Example: ${field.fieldExample}`,
        ...field.fieldExampleStyle,
    }
    if (title?.fontFamily) {
        fontSet.add(title.fontFamily)
    }

    if (subtitle?.fontFamily) {
        fontSet.add(subtitle.fontFamily)
    }

    if (bottomMessage?.fontFamily) {
        fontSet.add(bottomMessage.fontFamily)
    }

    for (const font of fontSet) {
        const loadedFont = await loadGoogleFontAllVariants(font)
        fonts.push(...loadedFont)
    }

    return { title, subtitle, bottomMessage, fonts }
}
