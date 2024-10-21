'use server'
import type { BuildFrameData } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import BasicView from '@/sdk/views/BasicView'
import type { Config, FormField, Storage } from '..'

export default async function cover({
    body,
    config,
    storage,
    params,
}: {
    body: undefined
    config: Config
    storage: Storage
    params: any
}): Promise<BuildFrameData> {
    const firstField = config.fields[0] as FormField
    if (!firstField) {
        throw new FrameError('No fields in the form')
    }
    const isLastField = config.fields.length === 1

    console.log('isLastField', isLastField)

    const fonts = await loadGoogleFontAllVariants('Roboto')

    return {
        buttons:
            firstField.type === 'choice'
                ? firstField.options.filter(Boolean).map((option) => ({ label: option }))
                : [{ label: isLastField ? 'Finish' : 'Submit →' }],
        inputText: firstField.type === 'text' ? firstField.placeholder : undefined,
        fonts: fonts,
        component: BasicView({
            background:
                'radial-gradient(circle at left center, rgba(60,5,103,1) 0%, rgba(0,0,0,1) 84%)',
            title: {
                text: firstField.message,
                position: 'left',
                fontSize: 50,
                fontWeight: 'bold',
                fontFamily: 'Roboto',
            },
        }),
        handler: 'field',
        params: {
            currentField: 0,
        },
    }
}
