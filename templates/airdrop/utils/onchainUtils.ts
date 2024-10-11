import {
    type CAIP19,
    createGlideConfig,
    createSession,
    currencies,
    listPaymentOptions,
    updatePaymentTransaction,
    waitForSession,
} from '@paywithglide/glide-js'
import type { Address } from 'viem'
import {
    http,
    type EncodeFunctionDataParameters,
    createPublicClient,
    createWalletClient,
    encodeFunctionData,
    erc20Abi,
    parseEther,
    parseUnits,
    publicActions,
    decodeFunctionData,
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { arbitrum, base, mainnet, optimism, polygon } from 'viem/chains'
import { airdropChains } from '../index'
import { FrameError } from '@/sdk/error'
type Configuration = {
    operatorPrivateKey: string
    chain: keyof typeof airdropChains
    paymentAmount: number
    receiverAddress: string
    tokenAddress: string
    walletAddress: string
}
const chainKeyToChain = {
    mainnet: mainnet,
    arbitrum: arbitrum,
    base: base,
    optimism: optimism,
    polygon: polygon,
}

export const glideConfig = createGlideConfig({
    projectId: process.env.GLIDE_PROJECT_ID!,
    chains: Object.values(chainKeyToChain),
})

export async function transferTokenToAddress(configuration: Configuration) {
    const {
        operatorPrivateKey,
        chain,
        tokenAddress,
        walletAddress,
        receiverAddress,
        paymentAmount,
    } = configuration

    const account = privateKeyToAccount(operatorPrivateKey as Address)

    const walletClient = createWalletClient({
        chain: chain == 'ethereum' ? chainKeyToChain['mainnet'] : chainKeyToChain[chain],
        transport: http(),
        account,
    }).extend(publicActions)
    const args = [walletAddress, receiverAddress, parseEther(`${paymentAmount}`)]
    const functionName = 'transferFrom'

    const data = encodeFunctionData({
        abi: erc20Abi,
        functionName,
        args,
    } as EncodeFunctionDataParameters)
    try {
        const txHash = await walletClient.sendTransaction({
            to: tokenAddress as Address,
            data,
        })
        console.log(txHash)
        return txHash
    } catch (error) {
        console.log('Something went wrong sending tokens to address')
        return null
    }
}
export async function transferTokenToAddressUsingGlide(
    configuration: Configuration,
    crossToken: Token
) {
    const {
        operatorPrivateKey,
        chain,
        tokenAddress,
        walletAddress,
        receiverAddress,
        paymentAmount,
    } = configuration

    // Create an account from the private key
    const account = privateKeyToAccount(operatorPrivateKey as Address)

    // Setup wallet client
    const walletClient = createWalletClient({
        chain: chain === 'ethereum' ? chainKeyToChain['mainnet'] : chainKeyToChain[chain],
        transport: http(),
        account,
    }).extend(publicActions)

    // Create Glide session for payment
    const session = await createSession(glideConfig, {
        paymentCurrency: crossToken.paymentCurrency,
        paymentAmount,
        chainId: airdropChains[chain],
        address: tokenAddress as Address,
        abi: erc20Abi,
        functionName: 'transfer',
        args: [receiverAddress, parseUnits(`${paymentAmount}`, currencies.usdc.decimals)],
    })

    if (!session || !session.unsignedTransaction) {
        throw new FrameError('Failed to create Glide session or unsigned transaction not found.')
    }

    // Convert the `transfer` unsigned transaction to `transferFrom`
    //@ts-expect-error: session.unsignedTransaction returns untyped
    const transaction = convertTransferToTransferFrom(session.unsignedTransaction, walletAddress)

    // Send the transaction using the wallet client
    try {
        console.log('Sending transaction...')
        const txHash = await walletClient.sendTransaction(transaction)
        console.log('Transaction sent! Hash:', txHash)

        // Update the Glide payment transaction
        console.log('Updating payment transaction with Glide...')
        const { success } = await updatePaymentTransaction(glideConfig, {
            sessionId: session.sessionId,
            hash: txHash as `0x${string}`,
        })

        console.log({ success })

        // Wait for session to complete
        console.log('Waiting for session...')
        const res = await waitForSession(glideConfig, session.sessionId)
        console.log({ res })

        return txHash
    } catch (error) {
        console.error('Error while sending transaction via Glide:', error)
        return null
    }
}

function convertTransferToTransferFrom(
    unsignedTransaction: { chainId: string; input: Address; to: string; value: bigint },
    payerAddress: string
) {
    const decoded = decodeFunctionData({
        abi: erc20Abi,
        data: unsignedTransaction.input,
    })

    const transferFromData = {
        functionName: 'transferFrom',
        args: [payerAddress, decoded.args[0] as `0x${string}`, decoded.args[1] as bigint],
        abi: erc20Abi,
    } as const

    // Encode the function data
    //@ts-expect-error:
    const data = encodeFunctionData(transferFromData)
    return {
        to: unsignedTransaction.to as Address,
        data,
    }
}

export async function getContractDetails(
    chain: keyof typeof chainKeyToChain,
    contractAddress: Address
) {
    const client = createPublicClient({
        chain: chainKeyToChain[chain],
        transport: http(),
    })

    try {
        const [name, symbol] = await Promise.all([
            client.readContract({
                address: contractAddress as `0x${string}`,
                abi: erc20Abi,
                functionName: 'name',
            }),
            client.readContract({
                address: contractAddress as `0x${string}`,
                abi: erc20Abi,
                functionName: 'symbol',
            }),
        ])

        return { name, symbol }
    } catch (error) {
        console.error('Error fetching token details:', error)
        return null
    }
}

export async function getCrossChainTokenDetails(
    chain: keyof typeof chainKeyToChain,
    contractAddress: Address,
    tokenSymbol?: string
) {
    const GLIDE_PROJECT_ID =
        process.env.GLIDE_PROJECT_ID || process.env.NEXT_PUBLIC_GLIDE_PROJECT_ID
    console.log(GLIDE_PROJECT_ID)
    if (!GLIDE_PROJECT_ID) {
        throw new Error('GLIDE_PROJECT_ID is not set')
    }

    const glideConfig = createGlideConfig({
        projectId: GLIDE_PROJECT_ID,
        chains: Object.values(chainKeyToChain),
    })
    const chainId = chainKeyToChain[chain].id
    console.log('fetching item....')
    const dummyRecepientAddress = '0x8ff47879d9eE072b593604b8b3009577Ff7d6809'
    try {
        const amount = tokenSymbol?.toLowerCase() === 'usdc' ? parseUnits('1', 6) : parseEther('1')
        console.log(amount)
        const paymentOptions = await listPaymentOptions(glideConfig, {
            chainId,
            address: contractAddress,
            abi: erc20Abi,
            functionName: 'transfer',
            args: [dummyRecepientAddress, amount],
        })
        console.log(paymentOptions)
        return paymentOptions
    } catch (error) {
        console.error('Error fetching token details:', error)
        return null
    }
}

export interface Token {
    balance: string
    balanceUSD: string
    chainId: string
    chainLogoUrl: string
    chainName: string
    currencyLogoURL: string
    currencyLogoUrl: string
    currencyName: string
    currencySymbol: string
    paymentAmount: string
    paymentAmountUSD: string
    paymentCurrency: CAIP19
    totalFeeUSD: string
    transactionAmount: string
    transactionAmountUSD: string
    transactionCurrency: string
    transactionCurrencyLogoUrl: string
    transactionCurrencyName: string
    transactionCurrencySymbol: string
}

export function getDetailsFromPaymentCurrency(caip19: string) {
    // Split the CAIP19 string by "/"
    const parts = caip19.split('/')

    if (parts.length < 2) {
        return { chainId: null, hexAddress: null }
    }

    // Extract the chainId from the "eip155:{chainId}" part
    const chainPart = parts[0].split(':')
    let chainId = null

    if (chainPart.length === 2 && chainPart[0] === 'eip155') {
        chainId = Number(chainPart[1])
        if (isNaN(chainId)) {
            chainId = null
        }
    }

    // Check the second part (slip44 or erc20)
    const typePart = parts[1].split(':')
    let hexAddress = null

    if (typePart.length === 2) {
        if (typePart[0] === 'erc20') {
            // It's an ERC20 token, extract the Hex address
            hexAddress = typePart[1] // This should be the hex address part
        }
        // If it's "slip44", hexAddress remains null
    }

    return { chainId, hexAddress }
}
