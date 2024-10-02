import type { Config } from '..'
import type { getSliceProduct } from '../common/slice'

export default function ProductView(
    config: Config,
    product: Awaited<ReturnType<typeof getSliceProduct>>
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
    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'center',
                fontFamily: config.fontFamily || 'Roboto',
                justifyContent: 'space-between',
                fontSize: '50px',
                color: config.primaryColor || 'white',
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
                        // border: '5px solid ',
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
                        fontSize: '100px',
                        fontWeight: config.titleWeight || 'bold',
                        fontFamily: config.fontFamily || 'Roboto',
                        color: config.primaryColor || 'white',
                        fontStyle: config.titleStyle || 'normal',
                        display: 'flex',
                    }}
                >
                    {product.title}
                </div>
                <div
                    style={{
                        fontSize: '40px',
                        fontWeight: config.titleWeight || 'normal',
                        fontFamily: config.fontFamily || 'Roboto',
                        color: config.secondaryColor || 'grey',
                        fontStyle: config.titleStyle || 'normal',
                        display: 'flex',
                    }}
                >
                    {product.description}
                </div>
            </div>

            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignSelf: 'center',
                        fontSize: 28,
                    }}
                >
                    {product.handle}
                </div>

                <div
                    style={{
                        color: config.productInfo?.color || 'white',
                        display: 'flex',
                        fontSize: config.productInfo?.fontSize || 28,
                    }}
                >
                    {product.variantFormattedPrice}
                </div>
            </div>
        </div>
    )
}
