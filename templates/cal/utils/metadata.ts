import { client, baseClient, opClient } from './client'

// ABI for the name function of ERC721 tokens
const nameABI = [
    {
        constant: true,
        inputs: [],
        name: 'name',
        outputs: [{ name: '', type: 'string' }],
        type: 'function',
    },
]

async function getERC721ContractName(contractAddress: any, chain: any): Promise<string> {
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

export async function getName(contractAddress: string, chain: any) {
    return await getERC721ContractName(contractAddress, chain)
}
