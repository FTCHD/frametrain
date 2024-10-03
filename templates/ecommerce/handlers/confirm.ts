'use server'
import type { BuildFrameData, FrameButtonMetadata, FramePayloadValidated } from '@/lib/farcaster'
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
    const buttons: FrameButtonMetadata[] = [{ label: '→' }]
    const buttonIndex = body.tapped_button?.index || 1
    const textInput = body?.input?.text
    let inputText: string | undefined = undefined
    let quantity = 1
    let nextAction: ParamsActionType = 'email'
    let newStorage = storage
    let variant: string | undefined = undefined
    const userShippingInfo = storage.shippingInfo[body.interactor.fid]

    const fontSet = new Set(['Roboto'])
    const fonts: any[] = []

    console.log({ config, params, userShippingInfo, textInput })

    if (!config.storeInfo) {
        throw new FrameError('Store not available')
    }

    if (!params) {
        throw new FrameError('Missing params')
    }

    const currentAction = params.action
    const productId = Number(params.productId)
    const productFromArray = config.storeInfo.products.find((product) => product.id === productId)

    if (!productFromArray) {
        throw new FrameError('Product not found')
    }
    console.log('confirm after productFromArray', {
        currentAction,
        productFromArray,
        quantity,
        buttonIndex,
        userShippingInfo,
    })

    try {
        const product = await getSliceProduct(config.storeInfo.id, productId)

        console.log('confirm after product', {
            currentAction,
            product,
            quantity,
            buttonIndex,
            userShippingInfo,
        })

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
                }
                break
            }

            case 'email': {
                if (userShippingInfo?.email) {
                    inputText = 'Country, state, city'
                    nextAction = 'country'
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
                        [body.interactor.fid]: {
                            ...userShippingInfo,
                            email: textInput,
                        },
                    },
                }

                if (!(product.isDigital || userShippingInfo)) {
                    nextAction = 'country'
                } else {
                    nextAction = 'end'
                }

                break
            }

            case 'country': {
                const hasCountryInfo =
                    userShippingInfo?.city && userShippingInfo?.state && userShippingInfo?.country

                if (hasCountryInfo) {
                    inputText = 'Your address - zip code'
                    nextAction = 'address'
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
                        [body.interactor.fid]: {
                            ...userShippingInfo,
                            country,
                            state,
                            city,
                        },
                    },
                }

                nextAction = 'address'
                inputText = 'Address - Zip code'
                break
            }

            case 'address': {
                const hasAddressInfo = userShippingInfo?.address && userShippingInfo?.zip

                if (hasAddressInfo) {
                    inputText = '(prefix) phonenumber'
                    nextAction = 'phone'
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
                        [body.interactor.fid]: {
                            ...userShippingInfo,
                            address,
                            zip,
                        },
                    },
                }

                nextAction = 'phone'
                inputText = '(prefix) phonenumber'
                break
            }

            case 'phone': {
                const hasPhoneInfo = userShippingInfo?.phoneNumber && userShippingInfo?.phonePrefix

                if (hasPhoneInfo) {
                    nextAction = 'end'
                    break
                }

                if (!textInput) {
                    throw new FrameError('Phone number required')
                }

                const phoneSplit = textInput.split(' ')

                if (phoneSplit.length !== 2 || !/^\+[1-9][0-9]{0,3} [0-9]{6,10}$/.test(textInput)) {
                    throw new FrameError('Phone number required in the format: +1 123456789')
                }

                const [phonePrefix, phoneNumber] = phoneSplit

                newStorage = {
                    ...storage,
                    shippingInfo: {
                        ...storage.shippingInfo,
                        [body.interactor.fid]: {
                            ...userShippingInfo,
                            phonePrefix,
                            phoneNumber,
                        },
                    },
                }
                nextAction = 'end'

                break
            }

            default: {
                buttons.length = 0
                buttons.push({
                    label: 'Buy',
                    action: 'tx',
                    handler: 'txData',
                })
                break
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
            handler: nextAction === 'end' ? 'status' : 'product',
            params: {
                action: nextAction,
                productId,
            },
        }
    } catch (e) {
        const error = e as Error
        console.error('confirm >> error', error)
        throw new FrameError(error.message)
    }
}
