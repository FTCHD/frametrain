export const erc1155Abi = [
    {
        stateMutability: 'view',
        type: 'function',
        inputs: [
            { name: '', internalType: 'address', type: 'address' },
            { name: '', internalType: 'uint256', type: 'uint256' },
        ],
        name: 'balanceOf',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    },
    {
        type: 'function',
        name: 'name',
        stateMutability: 'view',
        inputs: [],
        outputs: [
            {
                type: 'string',
            },
        ],
    },
    {
        type: 'function',
        name: 'symbol',
        stateMutability: 'view',
        inputs: [],
        outputs: [
            {
                type: 'string',
            },
        ],
    },
] as const
