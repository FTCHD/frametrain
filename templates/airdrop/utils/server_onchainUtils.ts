'use server'

import { FrameError } from '@/sdk/error'
import { getGlide } from '@/sdk/glide'
import {
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
    encodeFunctionData,
    erc20Abi,
    http,
    parseEther,
    parseUnits,
    publicActions,
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import type { Config } from '../index'
import { airdropChains } from '../index'
import { type Configuration, chainKeyToChain, farcasterSupportedChains } from './lib'
import type { ChainKey } from '@/sdk/viem'

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
        console.log({ name, symbol })

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
        const symbol = tokenSymbol?.toLowerCase()
        let decimals
        if (!(currencies && symbol in currencies)) decimals = null
        decimals = currencies[symbol as keyof typeof currencies]?.decimals
        const amount = decimals ? parseUnits('1', decimals) : parseEther('1')

        const glideConfig = getGlide(farcasterSupportedChains as unknown as ChainKey[])

        const paymentOptions = await listPaymentOptions(glideConfig, {
            chainId,
            address: contractAddress,
            abi: erc20Abi,
            functionName: 'transfer',
            args: [dummyRecepientAddress, amount],
        })
        return paymentOptions
    } catch (error) {
        console.error('Error fetching token details:', error)
        return null
    }
}
