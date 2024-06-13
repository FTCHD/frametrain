import { NextRequest, NextResponse } from "next/server";
import {
    Abi,
    encodeFunctionData,
} from "viem";

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

// Handles POST requests to /api
export async function POST(req: NextRequest) {
    try {
        const tokenAddress = req.nextUrl.searchParams.get("tokenAddress")
        const to = req.nextUrl.searchParams.get("to")
        const value = req.nextUrl.searchParams.get("value")

        const calldata = encodeFunctionData({
            abi: contractAbi as Abi,
            functionName: "transfer",
            args: [to, value]
        })

        return NextResponse.json({
            chainId: "eip155:84532",  // base sepolia
            method: "eth_sendTransaction",
            params: {
            abi: contractAbi as Abi,
            to: tokenAddress as `0x${string}`,
            data: calldata as any,
            value: "0" // only send erc20
            },
        });
    } catch (error) {
        console.log(error)
        return NextResponse.error();
    }
}