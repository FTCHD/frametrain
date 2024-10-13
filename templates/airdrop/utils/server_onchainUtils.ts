import 'server-only'

import { FrameError } from '@/sdk/error'
import { getGlide } from '@/sdk/glide'
import {
    type CAIP19,
    createSession,
    currencies,
    listPaymentOptions,
    updatePaymentTransaction,
    waitForSession,
} from '@paywithglide/glide-js'
import type { Address } from 'viem'
import {
    type EncodeFunctionDataParameters,
    createPublicClient,
    createWalletClient,
    decodeFunctionData,
    encodeFunctionData,
    erc20Abi,
    http,
    parseEther,
    parseUnits,
    publicActions,
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { arbitrum, base, mainnet, optimism, polygon } from 'viem/chains'
import type { Config } from '../index'
import { airdropChains } from '../index'
type Configuration = {
    operatorPrivateKey: string
    chain: keyof typeof airdropChains
    paymentAmount: number
    receiverAddress: string
    tokenAddress: string
    walletAddress: string
}
export const chainKeyToChain = {
    mainnet: mainnet,
    arbitrum: arbitrum,
    base: base,
    optimism: optimism,
    polygon: polygon,
} as const

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
        return txHash
    } catch (error) {
        return null
    }
}
export async function transferTokenToAddressUsingGlide(
    configuration: Configuration,
    crossToken: Token,
    config: Config
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

    const glidePaymentAmount = Number(paymentAmount) * Number(crossToken.paymentAmount)
    //@ts-expect-error: config.tokenSymbol may not be a key of currencies
    const contractPaymentAmount = currencies?.[config.tokenSymbol?.toLowerCase()]?.decimals
        ? //@ts-expect-error: config.tokenSymbol may not be a key of currencies
          parseUnits(`${paymentAmount}`, currencies?.[config.tokenSymbol?.toLowerCase()]?.decimals)
        : parseEther(`${paymentAmount}`)
    const chainName = chain == 'ethereum' ? 'mainnet' : chain
    const glideConfig = getGlide(chainName)
    const session = await createSession(glideConfig, {
        paymentCurrency: crossToken.paymentCurrency,
        paymentAmount: glidePaymentAmount,
        chainId: airdropChains[chain],
        address: tokenAddress as Address,
        abi: erc20Abi,
        functionName: 'transfer',
        args: [receiverAddress, contractPaymentAmount],
    })

    if (!session || !session.unsignedTransaction) {
        throw new FrameError('Failed to create Glide session or unsigned transaction not found.')
    }

    // Convert the `transfer` unsigned transaction to `transferFrom`
    //@ts-expect-error: session.unsignedTransaction returns untyped
    const transaction = convertTransferToTransferFrom(session.unsignedTransaction, walletAddress)
    // Send the transaction using the wallet client
    try {
        const txHash = await walletClient.sendTransaction(transaction)

        //TODO: Abstract to this side downwards to a different route
        // Update the Glide payment transaction
        const { success } = await updatePaymentTransaction(glideConfig, {
            sessionId: session.sessionId,
            hash: txHash as `0x${string}`,
        })

        // Wait for session to complete
        const res = await waitForSession(glideConfig, session.sessionId)

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
    tokenSymbol: string
) {
    const chainId = chainKeyToChain[chain].id
    const dummyRecepientAddress = '0x8ff47879d9eE072b593604b8b3009577Ff7d6809'
    try {
        //@ts-expect-error: ts not sure if token symbol can index curencies`
        const amount = currencies?.[tokenSymbol?.toLowerCase()]?.decimals
            ? //@ts-expect-error: ts not sure if token symbol can index curencies`
              parseUnits('1', currencies?.[tokenSymbol?.toLowerCase()]?.decimals)
            : parseEther('1')

        const glideConfig = getGlide(chain)
        const paymentOptions = await listPaymentOptions(
            glideConfig,
            //@ts-expect-error: Ts expects accounts but it works without accounts
            {
                chainId,
                address: contractAddress,
                abi: erc20Abi,
                functionName: 'transfer',
                args: [dummyRecepientAddress, amount],
            }
        )
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
