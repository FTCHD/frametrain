import { type Abi, getAddress, parseAbi } from 'viem'
import { getViemClient } from './viem'

type BaseTokenParams = {
    addresses: string[]
    chain: string
    contractAddress: string
}

type Erc20TokenParams = BaseTokenParams &
    (
        | {
              erc: '721'
              tokenId?: string
          }
        | { erc: '20' }
        | {
              erc: '1155'
              tokenId: string
          }
    )

const ERC20_ABI = parseAbi([
    'function name() public view returns (string)',
    'function symbol() public view returns (string)',
    'function decimals() public view returns (uint8)',
    'function balanceOf(address _owner) public view returns (uint256 balance)',
])

const ERC721_ABI = parseAbi([
    'function name() public view returns (string)',
    'function symbol() public view returns (string)',
    'function balanceOf(address _owner) public view returns (uint256 balance)',
])

const ERC1155_ABI = parseAbi([
    'function name() public view returns (string)',
    'function symbol() public view returns (string)',
    'function balanceOf(address _owner, uint256 _id) public view returns (uint256)',
])

export async function holdsToken(args: Erc20TokenParams) {
    console.log('holdsToken>> args', args)
    const { addresses, chain, contractAddress, ...rest } = args
    const client = getViemClient(chain)
    const abis: Record<string, Abi> = {
        '20': ERC20_ABI,
        '721': ERC721_ABI,
        '1155': ERC1155_ABI,
    }

    const abi = abis[rest.erc]
    if (!abi) {
        throw new Error('Invalid ERC type')
    }

    const address = getAddress(contractAddress)
    console.log(`holdsToken>> Chain name: ${client.chain.name}`, {
        address,
    })

    const [name, symbol, decimals] = (await Promise.all([
        client.readContract({
            abi,
            address,
            functionName: 'name',
        }),
        client.readContract({
            abi,
            address,
            functionName: 'symbol',
        }),
        rest.erc === '20'
            ? client.readContract({
                  abi,
                  address,
                  functionName: 'decimals',
              })
            : Promise.resolve(0),
    ])) as [string, string, number]

    console.log(`holdsToken>> Token name: ${name}, symbol: ${symbol}`)

    const data: { name: string; symbol: string; decimals: number; balances: number[] } = {
        name,
        symbol,
        decimals,
        balances: [],
    }

    for (const ownerAddress of addresses) {
        const owner = getAddress(ownerAddress)
        const args = (rest.erc === '1155' ? [owner, rest.tokenId] : [owner]) as
            | [`0x${string}`, bigint]
            | [`0x${string}`]
        try {
            const balance = await client.readContract({
                abi,
                address,
                functionName: 'balanceOf',
                args,
            })
            data.balances.push(Number(balance))
        } catch (e) {
            const error = e as Error
            console.error('Error getting contract balance:', error.message)
        }
    }

    return data
}
