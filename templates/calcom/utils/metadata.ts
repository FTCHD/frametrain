import { client } from './client'

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

async function getERC721ContractName(contractAddress: any): Promise<string> {
    try {
        let name: any = await client.readContract({
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

export async function getName(contractAddress: string) {
    return await getERC721ContractName(contractAddress)
}
