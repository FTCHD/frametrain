'use server'
import type { BuildFrameData, FramePayloadValidated } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import BasicView from '@/sdk/views/BasicView'
import type { Config, FormField, Storage } from '..'
import initial from './initial'

export default async function field({
    body,
    config,
    storage,
    params,
}: {
    body: FramePayloadValidated
    config: Config
    storage: Storage
    params: any
}): Promise<BuildFrameData> {
    const { currentField: currentFieldIndex } = params as {
        currentField: number
    }

    // validate the field
    // validation means checking if the field is required and if the field is not empty
    // save the data, meaning returning it for the storage, saving it to the database in the object with the user's fid as key
    // go to next field or success page, if no success page, then go to initial page

    const currentField = config.fields[currentFieldIndex] as FormField
    const inputValue = body.input?.text || ''
    const isCurrentFieldMultipleChoice = currentField.type === 'choice'

    // Check if the user has already submitted a response for this field
    const userSubmissions = storage?.submissions?.[body.interactor.fid]
    if (userSubmissions && userSubmissions[currentField.label] !== undefined) {
        throw new FrameError('You have already submitted a response for this field')
    }

    if (!isCurrentFieldMultipleChoice && currentField.required && inputValue.trim() === '') {
        throw new FrameError('Entered value is missing')
    }

    console.log('fid', body.interactor.fid)
    console.log('currentField', currentField)

    const newStorage = Object.assign({}, storage, {
        submissions: {
            ...(storage?.submissions || {}),
            [body.interactor.fid]: {
                ...(storage?.submissions?.[body.interactor.fid] || {}),
                [currentField.label]: !isCurrentFieldMultipleChoice
                    ? inputValue
                    : currentField.options[body.tapped_button.index],
                timestamp: Date.now(),
            },
        },
    })

    const nextFieldIndex = currentFieldIndex + 1
    const isLastField = nextFieldIndex >= config.fields.length

    console.log('isLastField', isLastField)

    console.log('newStorage', newStorage)

    if (isLastField) {
        if (config.successType && config.successType !== 'disabled') {
            switch (config.successType) {
                case 'image': {
                    if (!config.successImageUrl) {
                        throw new FrameError('Success image not configured')
                    }
                    return {
                        buttons:
                            config.successButtons?.map((button) => ({ label: button.text })) || [],
                        image: config.successImageUrl,
                        handler: 'success',
                        storage: newStorage,
                        aspectRatio: '1:1',
                    }
                }

                case 'text': {
                    if (!config.successStyling) {
                        throw new FrameError('Success text styling not configured')
                    }
                    const roboto = await loadGoogleFontAllVariants('Roboto')
                    return {
                        buttons:
                            config.successButtons?.map((button) => ({ label: button.text })) || [],
                        fonts: roboto,
                        component: BasicView(config.successStyling),
                        handler: 'success',
                        storage: newStorage,
                        aspectRatio: '1:1',
                    }
                }

                case 'frame': {
                    if (!config.successFrameUrl) {
                        throw new FrameError('Success frame URL not configured')
                    }

                    return {
                        frame: config.successFrameUrl,
                        storage: newStorage,
                    }
                }
            }
        }

        const metadata = await initial({ body: undefined, config, storage, params })

        return {
            ...metadata,
            storage: newStorage,
        }
    }

    const nextField = config.fields[nextFieldIndex] as FormField
    const isNextFieldMultipleChoice = nextField.type === 'choice'

    if (isNextFieldMultipleChoice && !nextField?.options?.length) {
        throw new FrameError('Field not configured')
    }

    const fonts = await loadGoogleFontAllVariants('Roboto')

    return {
        buttons: isNextFieldMultipleChoice
            ? nextField.options.filter(Boolean).map((option) => ({ label: option }))
            : [{ label: 'Submit' }],
        inputText: !isNextFieldMultipleChoice ? nextField.placeholder : undefined,
        storage: newStorage,
        aspectRatio: '1:1',
        fonts: fonts,
        component: BasicView({
            background:
                'radial-gradient(circle at left center, rgba(60,5,103,1) 0%, rgba(0,0,0,1) 84%)',
            title: {
                text: nextField.message,
                position: 'left',
                fontSize: 50,
                fontWeight: 'bold',
                fontFamily: 'Roboto',
            },
        }),
        handler: 'field',
        params: {
            currentField: nextFieldIndex,
        },
    }
}
