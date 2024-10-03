'use server'
import type { BuildFrameData, FrameButtonMetadata, FramePayloadValidated } from '@/lib/farcaster'
import { runGatingChecks } from '@/lib/gating'
import { FrameError } from '@/sdk/error'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, Storage } from '..'
import { getSliceProduct } from '../common/slice'
import ProductView from '../views/Product'

type ParamsActionType = 'quantity' | 'email' | 'address' | 'end' | 'country' | 'phone'

export default async function confirm({
    body,
    config,
    storage,
    params,
}: {
    body: FramePayloadValidated
    config: Config
    storage: Storage
    params:
        | {
              action: ParamsActionType
              productId: string
          }
        | undefined
}): Promise<BuildFrameData> {
    await runGatingChecks(body, config.gating)

    const buttons: FrameButtonMetadata[] = [{ label: '→' }]
    const fid = body.interactor.fid //.toString()
    const buttonIndex = body.tapped_button?.index || 1
    const textInput = body?.input?.text
    let inputText: string | undefined = undefined
    let quantity = 1
    let nextAction: ParamsActionType = 'email'
    let newStorage = storage
    let variant: string | undefined = undefined
    const userShippingInfo = storage.shippingInfo?.[fid]

    const fontSet = new Set(['Roboto'])
    const fonts: any[] = []

    if (!config.storeInfo) {
        throw new FrameError('Store not available')
    }

    if (!params) {
        throw new FrameError('Missing params')
    }

    let currentAction = params.action
    const productId = Number(params.productId)
    const productFromArray = config.storeInfo.products.find((product) => product.id === productId)

    if (!productFromArray) {
        throw new FrameError('Product not found')
    }

    const product = await getSliceProduct(config.storeInfo.id, productId)

    let loop = true
    while (loop) {
        switch (currentAction) {
            case 'quantity': {
                if (textInput) {
                    quantity = Number(textInput)

                    if (isNaN(quantity)) {
                        throw new FrameError('Quantity must be a number')
                    }

                    if (!product.isInfinite) {
                        if (quantity > product.remainingUnits) {
                            throw new FrameError('Quantity exceeds remaining units')
                        }

                        if (quantity < 1) {
                            quantity = 1
                        } else if (quantity > product.maxPerBuyer) {
                            throw new FrameError(
                                `Quantity must be less than or equal to ${product.maxPerBuyer}`
                            )
                        }
                    }
                }

                if (productFromArray.variants.length > 0) {
                    variant = productFromArray.variants[buttonIndex - 1].variant
                }

                if (!userShippingInfo?.email) {
                    inputText = 'Your email'
                    loop = false
                } else {
                    currentAction = 'country'
                    inputText = 'Country, state, city'
                }
                break
            }

            case 'email': {
                if (userShippingInfo?.email) {
                    inputText = 'Country, state, city'
                    currentAction = 'country'
                    break
                }

                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

                if (!(textInput && emailRegex.test(textInput))) {
                    throw new FrameError('Invalid email')
                }

                newStorage = {
                    ...storage,
                    shippingInfo: {
                        ...storage.shippingInfo,
                        [fid]: {
                            ...userShippingInfo,
                            email: textInput.trim(),
                        },
                    },
                }

                if (!product.isDigital) {
                    inputText = 'Country, state, city'
                    currentAction = 'country'
                } else {
                    nextAction = 'end'
                    loop = false
                }

                break
            }

            case 'country': {
                const hasCountryInfo =
                    userShippingInfo?.city && userShippingInfo?.state && userShippingInfo?.country

                if (hasCountryInfo) {
                    inputText = 'Your address - zip code'
                    currentAction = 'address'
                    break
                }

                if (!textInput) {
                    throw new FrameError('Country, state, and city required')
                }

                const countrySplit = textInput.split(',')

                if (countrySplit.length !== 3) {
                    throw new FrameError(
                        'Country, state, and city required separated by commas (,)'
                    )
                }

                const [country, state, city] = countrySplit
                newStorage = {
                    ...storage,
                    shippingInfo: {
                        ...storage.shippingInfo,
                        [fid]: {
                            ...userShippingInfo,
                            country: country.trim(),
                            state: state.trim(),
                            city: city.trim(),
                        },
                    },
                }

                nextAction = 'address'
                inputText = 'Address - Zip code'
                loop = false
                break
            }

            case 'address': {
                const hasAddressInfo = userShippingInfo?.address && userShippingInfo?.zip

                if (hasAddressInfo) {
                    inputText = '+prefix phonenumber'
                    currentAction = 'phone'
                    break
                }

                if (!textInput) {
                    throw new FrameError('Address and zip required')
                }

                const addressSplit = textInput.split('-')

                if (addressSplit.length !== 2) {
                    throw new FrameError('Address and zip required separated by dashes (-)')
                }

                const [address, zip] = addressSplit
                newStorage = {
                    ...storage,
                    shippingInfo: {
                        ...storage.shippingInfo,
                        [fid]: {
                            ...userShippingInfo,
                            address: address.trim(),
                            zip: zip.trim(),
                        },
                    },
                }

                nextAction = 'phone'
                inputText = '+prefix phonenumber'
                loop = false
                break
            }

            case 'phone': {
                inputText = undefined
                const hasPhoneInfo = userShippingInfo?.phoneNumber && userShippingInfo?.phonePrefix

                if (hasPhoneInfo) {
                    nextAction = 'end'
                    loop = false
                    buttons.length = 0
                    buttons.push({
                        label: 'Buy',
                        action: 'tx',
                        handler: 'txData',
                    })
                    break
                }

                if (!textInput) {
                    throw new FrameError('Phone number required')
                }

                const phoneSplit = textInput.split(' ')

                if (phoneSplit.length !== 2 || !/^\+[1-9][0-9]{0,3} [0-9]{6,10}$/.test(textInput)) {
                    throw new FrameError(
                        'Invalid phone number. It should be in the format: +1 123456789'
                    )
                }

                const [phonePrefix, phoneNumber] = phoneSplit

                newStorage = {
                    ...storage,
                    shippingInfo: {
                        ...storage.shippingInfo,
                        [fid]: {
                            ...userShippingInfo,
                            phonePrefix: phonePrefix.trim(),
                            phoneNumber: phoneNumber.trim(),
                        },
                    },
                }
                nextAction = 'end'
                loop = false

                buttons.length = 0
                buttons.push({
                    label: 'Buy',
                    action: 'tx',
                    handler: 'txData',
                })

                break
            }

            // default: {
            //     break
            // }
        }
    }

    if (config.productTitle?.fontFamily) {
        fontSet.add(config.productTitle.fontFamily)
    }

    if (config.productDescription?.fontFamily) {
        fontSet.add(config.productDescription.fontFamily)
    }

    if (config.productInfo?.fontFamily) {
        fontSet.add(config.productInfo.fontFamily)
    }

    for (const font of fontSet) {
        const loadedFont = await loadGoogleFontAllVariants(font)
        fonts.push(...loadedFont)
    }

    return {
        storage: newStorage,
        fonts,
        buttons,
        inputText,
        component: ProductView(config, product, { quantity, variant }),
        handler: nextAction === 'end' ? 'success' : 'confirm',
        params: {
            action: nextAction,
            productId,
        },
    }
}
