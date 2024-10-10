import type { BasicViewStyle } from '@/sdk/views/BasicView'
import type { Config } from '..'

export default function ProductView(product: Config['products'][number]) {
    const backgroundProp: Record<string, string> = {}
    if (product.styles?.background) {
        if (product.styles.background?.startsWith('#')) {
            backgroundProp['backgroundColor'] = product.styles.background
        } else {
            backgroundProp['backgroundImage'] = product.styles.background
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

    const productStyles = product.styles
    const title = product.title.length > 60 ? product.title.slice(0, 60) + '...' : product.title
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
                        borderColor: productStyles?.title?.color || 'white',
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
                        fontSize: `${productStyles?.title?.fontSize || 50}px`,
                        fontWeight: productStyles?.title?.fontWeight || 'bold',
                        fontFamily: productStyles?.title?.fontFamily || 'Roboto',
                        color: productStyles?.title?.color || 'white',
                        fontStyle: productStyles?.title?.fontStyle || 'normal',
                        display: 'flex',
                        justifyContent: alignmentToFlex(productStyles?.title?.position),
                    }}
                >
                    {title}
                </div>
            </div>

            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: productStyles?.info?.fontSize || 20,
                    fontWeight: productStyles?.info?.fontWeight || 'normal',
                    fontFamily: productStyles?.info?.fontFamily || 'Roboto',
                    color: productStyles?.info?.color || 'white',
                    fontStyle: productStyles?.info?.fontStyle || 'normal',
                    bottom: 0,
                    left: 0,
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignSelf: 'center',
                        textAlign: 'center',
                        justifyContent: alignmentToFlex(productStyles?.info?.position),
                    }}
                >
                    {product.stars}
                </div>

                <div
                    style={{
                        display: 'flex',
                        textAlign: 'center',
                        justifyContent: alignmentToFlex(productStyles?.info?.position),
                    }}
                >
                    {product.ratings}
                </div>

                <div
                    style={{
                        display: 'flex',
                        textAlign: 'center',
                        justifyContent: alignmentToFlex(productStyles?.info?.position),
                    }}
                >
                    {product.price}
                </div>
            </div>
        </div>
    )
}
