import {
    ethClient,
    baseClient,
    blastClient,
    opClient,
    zoraClient,
    fantomClient,
    arbitrumClient,
    polygonClient,
    bscClient,
} from './viem'

const balanceOfABI721 = [
    {
        'constant': true,
        'inputs': [
            {
                'name': '_owner',
                'type': 'address',
            },
        ],
        'name': 'balanceOf',
        'outputs': [
            {
                'name': 'balance',
                'type': 'uint256',
            },
        ],
        'payable': false,
        'stateMutability': 'view',
        'type': 'function',
    },
] as const

const balanceOfABI1155 = [
    {
        'constant': true,
        'inputs': [
            {
                'name': '_owner',
                'type': 'address',
            },
            {
                'name': '_id',
                'type': 'uint256',
            },
        ],
        'name': 'balanceOf',
        'outputs': [
            {
                'name': 'balance',
                'type': 'uint256',
            },
        ],
        'payable': false,
        'stateMutability': 'view',
        'type': 'function',
    },
] as const

const nameABI = [
    {
        constant: true,
        inputs: [],
        name: 'name',
        outputs: [{ name: '', type: 'string' }],
        type: 'function',
    },
]

function getChainClient(chain: string) {
    let selectedClient

    switch (chain) {
        case 'ETH': {
            selectedClient = ethClient
            break
        }
        case 'BASE': {
            selectedClient = baseClient
            break
        }
        case 'OP': {
            selectedClient = opClient
            break
        }

        case 'ZORA': {
            selectedClient = zoraClient
            break
        }

        case 'BLAST': {
            selectedClient = blastClient
            break
        }

        case 'POLYGON': {
            selectedClient = polygonClient
            break
        }

        case 'FANTOM': {
            selectedClient = fantomClient
            break
        }

        case 'ARBITRUM': {
            selectedClient = arbitrumClient
            break
        }

        case 'BNB': {
            selectedClient = bscClient
            break
        }

        default:
            throw new Error('Unsupported chain')
    }

    return selectedClient
}

export const holdsErc721 = async (ownerAddresses: any, contract: any, chain: any) => {
    const calls = []
    let hasNFT = false

    const selectedClient = getChainClient(chain)

    // biome-ignore lint/style/useForOf: <explanation>
    for (let i = 0; i < ownerAddresses.length; i++) {
        calls.push({
            address: contract,
            abi: balanceOfABI721,
            functionName: 'balanceOf',
            args: [ownerAddresses[i]],
        })
    }

    const results = await selectedClient.multicall({
        contracts: calls,
    })

    // biome-ignore lint/style/useForOf: <explanation>
    for (let i = 0; i < results.length; i++) {
        if (results[i].result && results[i].result?.toString() !== '0') {
            hasNFT = true
            break
        }
    }

    return hasNFT
}

export const holdsErc1155 = async (
    ownerAddresses: any,
    contract: any,
    tokenId: any,
    chain: any
) => {
    const calls = []
    let hasNFT = false

    const selectedClient = getChainClient(chain)

    // biome-ignore lint/style/useForOf: <explanation>
    for (let i = 0; i < ownerAddresses.length; i++) {
        calls.push({
            address: contract,
            abi: balanceOfABI1155,
            functionName: 'balanceOf',
            args: [ownerAddresses[i], tokenId],
        })
    }

    const results = await selectedClient.multicall({
        contracts: calls,
    })

    // biome-ignore lint/style/useForOf: <explanation>
    for (let i = 0; i < results.length; i++) {
        if (results[i].result && results[i].result?.toString() !== '0') {
            hasNFT = true
            break
        }
    }

    return hasNFT
}

export async function getName(contractAddress: any, chain: any): Promise<string> {
    const selectedClient = getChainClient(chain)

    try {
        let name: any = await selectedClient.readContract({
            address: contractAddress,
            abi: nameABI,
            functionName: 'name',
            args: [],
        })
        name = name.toString()
        return name
    } catch (error) {
        console.error('Error getting contract name:', error)
        return ''
    }
}
