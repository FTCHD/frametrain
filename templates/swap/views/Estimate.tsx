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

export default function EstimateView(props?: Config) {
    if (!props) {
        return (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'black',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    fontFamily: 'Roboto',
                    fontSize: '50px',
                    color: '#ffffff',
                }}
            >
                Press "VIEW"
            </div>
        )
    }
    const { token0, token1, ...config } = props
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
                            fontSize: `${config.pairName?.fontSize || 50}px`,
                            fontWeight: config.pairName?.fontWeight || 'bold',
                            fontStyle: config.pairName?.fontStyle || 'normal',
                            fontFamily: config.pairName?.fontFamily || 'Roboto',
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
                        fontSize: `${config.pairName?.fontSize || 30}px`,
                        fontWeight: config.pairName?.fontWeight || 'bold',
                        fontStyle: config.pairName?.fontStyle || 'normal',
                        fontFamily: config.pairName?.fontFamily || 'Roboto',
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
                        fontSize: `${config.coverMessage?.fontSize || 20}px`,
                        fontWeight: config.coverMessage?.fontWeight || 'bold',
                        fontStyle: config.coverMessage?.fontStyle || 'normal',
                        fontFamily: config.coverMessage?.fontFamily || 'Roboto',
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
