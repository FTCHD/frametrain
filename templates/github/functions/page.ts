'use server'
import type { BuildFrameData, FrameActionPayload } from '@/lib/farcaster'
import type { Config, State } from '..'
import PageView from '../views/Page'
import { Abi, encodeFunctionData } from 'viem'

export default async function page(
    body: FrameActionPayload,
    config: Config,
    state: State,
    params: any
): Promise<BuildFrameData> {
    const { tokenAddress, to } = config
    const inputToken = body.untrustedData.inputText
    const contractAbi = [
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_to",
                    "type": "address"
                },
                {
                    "name": "_value",
                    "type": "uint256"
                }
            ],
            "name": "transfer",
            "outputs": [
                {
                    "name": "",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
    ]

    const calldata = encodeFunctionData({
        abi: contractAbi as Abi,
        functionName: "transfer",
        args: [to, inputToken]
    })

    const txData = {
        chainId: "eip155:84532",  // base sepolia
        method: "eth_sendTransaction",
        params: {
            abi: contractAbi as Abi,
            to: tokenAddress as `0x${string}`,
            data: calldata as any,
            value: "0" // only send erc20
        },
    }

    return {
        buttons: [
            {
                label: 'Send',
                action: 'tx',
                target: JSON.stringify(txData)
            },
            {
                label: 'Back',
            },
        ],
        inputText: 'Input token amount',
        component: PageView(config),
        functionName: 'initial',
    }
}
