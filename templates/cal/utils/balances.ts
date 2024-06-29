import { client, baseClient, opClient } from './client'

// ABI for the balanceOf function of ERC-20 tokens
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

export const balances721 = async (ownerAddresses: any, contract: any, chain: any) => {
    // biome-ignore lint/style/useConst: <explanation>
    let calls = []
    let hasNFT = false

    // biome-ignore lint/correctness/noUnusedVariables: <explanation>
    let selectedClient
    switch (chain) {
        case 'ETH': {
            selectedClient = client
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
        default:
            throw new Error('Unsupported chain')
    }

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

export const balancesERC1155 = async (
    ownerAddresses: any,
    contract: any,
    tokenId: any,
    chain: any
) => {
    // biome-ignore lint/style/useConst: <explanation>
    let calls = []
    let hasNFT = false

    // biome-ignore lint/correctness/noUnusedVariables: <explanation>
    let selectedClient
    switch (chain) {
        case 'ETH': {
            selectedClient = client
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
        default:
            throw new Error('Unsupported chain')
    }

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
