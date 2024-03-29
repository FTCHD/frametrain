
export const contractTypes = {
    LL: 'Linear Lockup',
    LL2: 'Linear Lockup',
    LD: 'Dynamic Lockup',
    LD2: 'Dynamic Lockup',
}

type TypeToAddressMainnet = {
    [Key in keyof typeof contractTypes]: string
}

export const typeToAddressMainnet: TypeToAddressMainnet = {
    LL: '0xb10daee1fcf62243ae27776d7a92d39dc8740f95',
    LL2: '0xAFb979d9afAd1aD27C5eFf4E27226E3AB9e5dCC9'.toLowerCase(),
    LD: '0x39efdc3dbb57b2388ccc4bb40ac4cb1226bc9e44',
    LD2: '0x7CC7e125d83A581ff438608490Cc0f7bDff79127'.toLowerCase(),
}

// export const typeToAddressArbitrum = {
//     'LL': '0xFDD9d122B451F549f48c4942c6fa6646D849e8C1'.toLowerCase(),
//     'LD2': '0xf390cE6f54e4dc7C5A5f7f8689062b7591F7111d'.toLowerCase(),
// }

export const chainToEndpoint = {
    '1': 'https://api.thegraph.com/subgraphs/name/sablier-labs/sablier-v2',
    '42161': 'https://api.thegraph.com/subgraphs/name/sablier-labs/sablier-v2-arbitrum',
}

export const categoryToReadable = {
    LockupLinear: 'Linear Lockup',
    LockupDynamic: 'Dynamic Lockup',
}

const metadataArbitrum = {
    id: 42161,
    name: 'Arbitrum One',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
}

const metadataMainnet = {
    id: 1,
    name: 'Ethereum',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
}

const metadataPolygon = {
    id: 137,
    name: 'Polygon',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
}

const metadataAvalanche = {
    id: 43114,
    name: 'Avalanche',
    nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 },
}

const metadataBase = {
    id: 8453,
    name: 'Base',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
}

const metadataBnb = {
    id: 56,
    name: 'BNB Chain',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
}

const metadataGnosis = {
    id: 100,
    name: 'Gnosis',
    nativeCurrency: {
        decimals: 18,
        name: 'Gnosis',
        symbol: 'xDAI',
    },
}

const metadataOptimism = {
    id: 10,
    name: 'Optimism',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
}

const metadataScroll = {
    id: 534352,
    name: 'Scroll',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
}

export const chainIdToMetadata: Record<
    string,
    { id: number; name: string; nativeCurrency: { name: string; symbol: string; decimals: number } }
> = {
    '1': metadataMainnet,
    '42161': metadataArbitrum,
    '137': metadataPolygon,
    '43114': metadataAvalanche,
    '8453': metadataBase,
    '56': metadataBnb,
    '100': metadataGnosis,
    '10': metadataOptimism,
    '534352': metadataScroll,
}
