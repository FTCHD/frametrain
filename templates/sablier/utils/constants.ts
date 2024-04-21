
export const contractTypes = {
    LL: 'Linear Lockup',
    LL2: 'Linear Lockup',
    LD: 'Dynamic Lockup',
    LD2: 'Dynamic Lockup',
}

type TypeToAddressType = {
    [Key in keyof typeof contractTypes]: string
}

export const typeToAddressMainnet: TypeToAddressType = {
    LL: '0xb10daee1fcf62243ae27776d7a92d39dc8740f95'.toLowerCase(),
    LL2: '0xAFb979d9afAd1aD27C5eFf4E27226E3AB9e5dCC9'.toLowerCase(),
    LD: '0x39efdc3dbb57b2388ccc4bb40ac4cb1226bc9e44'.toLowerCase(),
    LD2: '0x7CC7e125d83A581ff438608490Cc0f7bDff79127'.toLowerCase(),
}

export const typeToAddressArbitrum: TypeToAddressType = {
    LL: '0x197d655f3be03903fd25e7828c3534504bfe525e'.toLowerCase(),
    LL2: '0xfdd9d122b451f549f48c4942c6fa6646d849e8c1'.toLowerCase(),
    LD: '0xa9efbef1a35ff80041f567391bdc9813b2d50197'.toLowerCase(),
    LD2: '0xf390ce6f54e4dc7c5a5f7f8689062b7591f7111d'.toLowerCase(),
}

export const typeToAddressPolygon: TypeToAddressType = {
    LL: '0x67422c3e36a908d5c3237e9cffeb40bde7060f6e'.toLowerCase(),
    LL2: '0x5f0e1dea4a635976ef51ec2a2ed41490d1eba003'.toLowerCase(),
    LD: '0x7313addb53f96a4f710d3b91645c62b434190725'.toLowerCase(),
    LD2: '0xb194c7278c627d52e440316b74c5f24fc70c1565'.toLowerCase(),
}

export const typeToAddressGnosis: TypeToAddressType = {
    LL: '0x685e92c9ca2bb23f1b596d0a7d749c0603e88585'.toLowerCase(),
    LL2: '0xce49854a647a1723e8fb7cc3d190cab29a44ab48'.toLowerCase(),
    LD: '0xeb148e4ec13aaa65328c0ba089a278138e9e53f9'.toLowerCase(),
    LD2: '0x1DF83C7682080B0f0c26a20C6C9CB8623e0Df24E'.toLowerCase(),
}

export const typeToAddressOptimism: TypeToAddressType = {
    LL: '0xb923abdca17aed90eb5ec5e407bd37164f632bfd'.toLowerCase(),
    LL2: '0x4b45090152a5731b5bc71b5baf71e60e05b33867'.toLowerCase(),
    LD: '0x6f68516c21e248cddfaf4898e66b2b0adee0e0d6'.toLowerCase(),
    LD2: '0xd6920c1094eabc4b71f3dc411a1566f64f4c206e'.toLowerCase(),
}

export const typeToAddressScroll: TypeToAddressType = {
    LL: '0x80640ca758615ee83801ec43452feea09a202d33'.toLowerCase(),
    LL2: '0x57e14ab4dad920548899d86b54ad47ea27f00987'.toLowerCase(),
    LD: '0xde6a30d851efd0fc2a9c922f294801cfd5fcb3a1'.toLowerCase(),
    LD2: '0xaaff2d11f9e7cd2a9cdc674931fac0358a165995'.toLowerCase(),
}

export const typeToAddressBase: TypeToAddressType = {
    LL: '0x6b9a46c8377f21517e65fa3899b3a9fab19d17f5'.toLowerCase(),
    LL2: '0x50c5725949a6f0c72e6c4a641f24049a917db0cb'.toLowerCase(),
    LD: '0x645b00960dc352e699f89a81fc845c0c645231cf'.toLowerCase(),
    LD2: '0x461e13056a3a3265cef4c593f01b2e960755de91'.toLowerCase(),
}

export const typeToAddressBnb: TypeToAddressType = {
    LL: '0x3fe4333f62a75c2a85c8211c6aefd1b9bfde6e51'.toLowerCase(),
    LL2: '0x14c35e126d75234a90c9fb185bf8ad3edb6a90d2'.toLowerCase(),
    LD: '0xf2f3fef2454dca59eca929d2d8cd2a8669cc6214'.toLowerCase(),
    LD2: '0xf900c5e3aa95b59cc976e6bc9c0998618729a5fa'.toLowerCase(),
}

export const typeToAddressAvalanche: TypeToAddressType = {
    LL: '0x610346e9088afa70d6b03e96a800b3267e75ca19'.toLowerCase(),
    LL2: '0xb24b65e015620455bb41deaad4e1902f1be9805f'.toLowerCase(),
    LD: '0x665d1c8337f1035cfbe13dd94bb669110b975f5f'.toLowerCase(),
    LD2: '0x0310da0d8ff141166ed47548f00c96464880781f'.toLowerCase(),
}

export const chainToTypeMap = {
    '1': typeToAddressMainnet,
    '42161': typeToAddressArbitrum,
    '137': typeToAddressPolygon,
    '10': typeToAddressOptimism,
    '56': typeToAddressBnb,
    '100': typeToAddressGnosis,
    '8453': typeToAddressBase,
    '43114': typeToAddressAvalanche,
    '534352': typeToAddressScroll,
}



export const chainToEndpoint = {
    '1': 'https://api.thegraph.com/subgraphs/name/sablier-labs/sablier-v2',
    '42161': 'https://api.thegraph.com/subgraphs/name/sablier-labs/sablier-v2-arbitrum',
    '137': 'https://api.thegraph.com/subgraphs/name/sablier-labs/sablier-v2-polygon',
    '10': 'https://api.thegraph.com/subgraphs/name/sablier-labs/sablier-v2-optimism',
    '56': 'https://api.thegraph.com/subgraphs/name/sablier-labs/sablier-v2-bsc',
    '100': 'https://api.thegraph.com/subgraphs/name/sablier-labs/sablier-v2-gnosis',
    '8453': 'https://api.studio.thegraph.com/query/57079/sablier-v2-base/version/latest',
    '43114': 'https://api.thegraph.com/subgraphs/name/sablier-labs/sablier-v2-avalanche',
    '534352': 'https://api.studio.thegraph.com/query/57079/sablier-v2-scroll/version/latest',
}

export const categoryToReadable = {
    LockupLinear: 'Linear Lockup',
    LockupDynamic: 'Dynamic Lockup',
}

const metadataArbitrum = {
    id: 42161,
    name: 'Arbitrum One',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    icon: 'https://app.sablier.com/_next/static/media/arbitrum.40bb2edb.png',
    color: '#06182e',
}

const metadataMainnet = {
    id: 1,
    name: 'Ethereum',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    icon: 'https://app.sablier.com/_next/static/media/ethereum-purple.45538fe4.png',
    color: '#04132e',
}

const metadataPolygon = {
    id: 137,
    name: 'Polygon',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    icon: 'https://app.sablier.com/_next/static/media/matic.9aee98ed.png',
    color: '#240736',
}

const metadataAvalanche = {
    id: 43114,
    name: 'Avalanche',
    nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 },
    icon: 'https://app.sablier.com/_next/static/media/avalanche.c109a4b1.png',
    color: '#361403',
}

const metadataBase = {
    id: 8453,
    name: 'Base',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    icon: 'https://app.sablier.com/_next/static/media/base.716503f4.png',
    color: '#030f36',
}

const metadataBnb = {
    id: 56,
    name: 'BNB Chain',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    icon: 'https://app.sablier.com/_next/static/media/bsc.ff896246.png',
    color: '#362b03',
}

const metadataGnosis = {
    id: 100,
    name: 'Gnosis',
    nativeCurrency: {
        decimals: 18,
        name: 'Gnosis',
        symbol: 'xDAI',
    },
    icon: 'https://app.sablier.com/_next/static/media/gnosis.f70823ba.png',
    color: '#033614',
}

const metadataOptimism = {
    id: 10,
    name: 'Optimism',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    icon: 'https://app.sablier.com/_next/static/media/optimism.2c9aa066.png',
    color: '#360903',
}

const metadataScroll = {
    id: 534352,
    name: 'Scroll',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    icon: 'https://app.sablier.com/_next/static/media/scroll.b8ef442e.png',
    color: '#453808',
}

export const chainIdToMetadata: Record<
    string,
    {
        id: number
        name: string
        nativeCurrency: { name: string; symbol: string; decimals: number }
        icon: string
        color: string
    }
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
