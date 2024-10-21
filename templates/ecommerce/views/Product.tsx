import type { BasicViewStyle } from '@/sdk/views/BasicView'
import type { Config } from '..'
import type { getSliceProduct } from '../common/slice'

export default function ProductView(
    config: Config,
    product: Awaited<ReturnType<typeof getSliceProduct>>,
    extra?: { quantity: number; variant?: string }
) {
    const backgroundProp: Record<string, string> = {}
    if (config.productBackground) {
        if (config.productBackground?.startsWith('#')) {
            backgroundProp['backgroundColor'] = config.productBackground
        } else {
            backgroundProp['backgroundImage'] = config.productBackground
        }
    } else {
        backgroundProp['backgroundColor'] = 'black'
    }

    const alignmentToFlex = (alignment: BasicViewStyle['position']): string => {
        switch (alignment) {
            case 'left':
                return 'flex-start'
            case 'right':
                return 'flex-end'
            default:
                return 'center'
        }
    }

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'center',
                padding: 50,
                gap: 40,
                ...backgroundProp,
            }}
        >
            <div tw="flex mx-auto w-[240px] h-[240px]">
                <img
                    src={product.image}
                    alt={product.title}
                    width={250}
                    height={250}
                    tw="rounded-xl max-w-[240px]"
                    style={{
                        width: 250,
                        height: 250,
                        borderColor: config.productTitle?.color || 'white',
                        objectFit: 'cover',
                        borderRadius: '.75rem',
                    }}
                />
            </div>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                }}
            >
                <div
                    style={{
                        fontSize: `${config.productTitle?.fontSize || 100}px`,
                        fontWeight: config.productTitle?.fontWeight || 'bold',
                        fontFamily: config.productTitle?.fontFamily || 'Roboto',
                        color: config.productTitle?.color || 'white',
                        fontStyle: config.productTitle?.fontStyle || 'normal',
                        display: 'flex',
                        justifyContent: alignmentToFlex(config.productTitle?.position),
                    }}
                >
                    {product.title}{' '}
                    {extra
                        ? `(x${extra.quantity} ${
                              extra.variant ? `- ${extra.variant} ${product.variantType}` : ''
                          })`
                        : ''}
                </div>
                <div
                    style={{
                        fontSize: `${config.productDescription?.fontSize || 40}px`,
                        fontWeight: config.productDescription?.fontWeight || 'normal',
                        fontFamily: config.productDescription?.fontFamily || 'Roboto',
                        color: config.productDescription?.color || 'grey',
                        fontStyle: config.productDescription?.fontStyle || 'normal',
                        display: 'flex',
                        justifyContent: alignmentToFlex(config.productDescription?.position),
                    }}
                >
                    {product.description}
                </div>
            </div>

            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: config.productInfo?.fontSize || 28,
                    fontWeight: config.productInfo?.fontWeight || 'normal',
                    fontFamily: config.productInfo?.fontFamily || 'Roboto',
                    color: config.productInfo?.color || 'white',
                    fontStyle: config.productInfo?.fontStyle || 'normal',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignSelf: 'center',
                        textAlign: 'center',
                    }}
                >
                    Stock: {product.isInfinite ? 'Unlimited' : product.remainingUnits}
                </div>

                <div
                    style={{
                        display: 'flex',
                        textAlign: 'center',
                    }}
                >
                    Limit: {product.isInfinite ? 'Unlimited' : product.maxPerBuyer}
                </div>

                <div
                    style={{
                        display: 'flex',
                        textAlign: 'center',
                    }}
                >
                    {product.variantFormattedPrice}
                </div>
            </div>
        </div>
    )
}
