import type { Config as BaseConfig } from '..'

type Token = {
    logo: string
    symbol: string
}

type Config = {
    coverMessage?: BaseConfig['coverMessage']
    pairName?: BaseConfig['pairName']
    backgroundColor?: BaseConfig['backgroundColor']
    token0: Token
    token1: Token
    network?: string
    price: number
}

export default function EstimateView({ token0, token1, ...config }: Config) {
    const backgroundProp: Record<string, string> = {}
    if (config.backgroundColor) {
        if (config.backgroundColor?.startsWith('#')) {
            backgroundProp['backgroundColor'] = config.backgroundColor
        } else {
            backgroundProp['backgroundImage'] = config.backgroundColor
        }
    } else {
        backgroundProp['backgroundColor'] = '#black'
    }
    const assets = [
        {
            name: token0.symbol,
            image: token0.logo,
        },
        {
            name: token1.symbol,
            image: token1.logo,
        },
    ]
    return (
        <div
            tw="flex flex-col w-full h-full overflow-hidden rounded-sm p-4"
            style={{
                ...backgroundProp,
                gap: 30,
            }}
        >
            <div
                tw="flex justify-between border rounded-md border-gray-300 items-center"
                style={{
                    padding: 15,
                }}
            >
                <div tw="flex items-center" style={{ gap: 10 }}>
                    <div style={{ display: 'flex', gap: -30 }}>
                        {assets.map((asset, i) => (
                            <img
                                key={i}
                                alt={asset.name}
                                src={asset.image}
                                width={54}
                                height={54}
                                style={{ borderRadius: 99 }}
                            />
                        ))}
                    </div>
                    <span
                        style={{
                            color: config.pairName?.color || 'white',
                            fontSize: `${config.pairName?.size || 20}px`,
                            fontWeight: config.pairName?.weight || 'bold',
                            fontStyle: config.pairName?.style || 'normal',
                            fontFamily: config.pairName?.font || 'Roboto',
                            marginBottom: '5px',
                        }}
                    >
                        {token0.symbol} / {token1.symbol}
                    </span>
                </div>
            </div>
            <div
                tw="flex p-5 border rounded-md border-gray-300"
                style={{
                    borderColor: config.pairName?.color || 'white',
                }}
            >
                <span
                    style={{
                        color: config.pairName?.color || 'white',
                        fontSize: `${config.pairName?.size || 20}px`,
                        fontWeight: config.pairName?.weight || 'bold',
                        fontStyle: config.pairName?.style || 'normal',
                        fontFamily: config.pairName?.font || 'Roboto',
                        marginBottom: '5px',
                    }}
                >
                    ${config.price}
                </span>
            </div>
            {config.coverMessage && (
                <span
                    tw="p-5"
                    style={{
                        color: config.coverMessage?.color || 'white',
                        fontSize: `${config.coverMessage?.size || 20}px`,
                        fontWeight: config.coverMessage?.weight || 'bold',
                        fontStyle: config.coverMessage?.style || 'normal',
                        fontFamily: config.coverMessage?.font || 'Roboto',
                        position: 'absolute',
                        bottom: 20,
                        textAlign: 'left',
                        lineHeight: 1.3,
                    }}
                >
                    {config?.coverMessage?.text ?? 'Custom message'}
                </span>
            )}
        </div>
    )
}
