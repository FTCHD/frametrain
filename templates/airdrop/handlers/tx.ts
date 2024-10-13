'use server'
import type { BuildFrameData, FramePayloadValidated } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import {
    type Abi,
    type EncodeFunctionDataParameters,
    type GetAbiItemParameters,
    encodeFunctionData,
    erc20Abi,
    getAbiItem,
    maxInt256,
} from 'viem'
import { privateKeyToAddress } from 'viem/accounts'
import { type Config, type Storage, airdropChains } from '..'
import { getDetailsFromPaymentCurrency } from '../utils/server_onchainUtils'

export default async function txData({
    config,
    params,
    storage,
    body,
}: {
    body: FramePayloadValidated
    config: Config
    storage: Storage
    params:
        | {
              buyAmount: string
              ts: string
          }
        | undefined
}): Promise<BuildFrameData> {
    const userFid = body.interactor.fid
    const creatorFid = config.creatorId
    const chain = config.chain

    if (userFid !== creatorFid) {
        throw new FrameError('You are not approved to use this function')
    }
    const FRAME_TRAIN_OPERATOR_PRIVATE_KEY = process.env
        .FRAME_TRAIN_OPERATOR_PRIVATE_KEY as `0x${string}`

    if (!FRAME_TRAIN_OPERATOR_PRIVATE_KEY) {
        throw new FrameError('FRAME_TRAIN_OPERATOR_PRIVATE_KEY is not set')
    }

    const chainId = airdropChains[config.chain]

    const frameOperatorAddress = privateKeyToAddress(FRAME_TRAIN_OPERATOR_PRIVATE_KEY)
    const args = [frameOperatorAddress, maxInt256]
    const functionName = 'approve'
    const abiItem = getAbiItem({
        abi: erc20Abi,
        name: functionName,
        args,
    } as GetAbiItemParameters)
    let data
    try {
        data = encodeFunctionData({
            abi: erc20Abi,
            functionName,
            args,
        } as EncodeFunctionDataParameters)
    } catch (error) {}
    const abiErrorItems = (erc20Abi as Abi).filter((item) => item.type === 'error')
    let toAddress = config.tokenAddress
    let toChain = chainId
    if (config.crossTokenEnabled && config.crossToken.chain && config.crossToken.symbol) {
        const chainName = config.chain === 'ethereum' ? 'mainnet' : config.chain
        const crossTokenKey = `${chainName}/${config.tokenAddress}`
        const crossTokens = config.crossTokens[crossTokenKey]

        const crossToken = crossTokens?.find(
            (token) =>
                token.currencySymbol === config.crossToken.symbol &&
                token.chainName.toLowerCase() === config.crossToken.chain
        )
        if (crossToken) {
            const chainAndAddress = getDetailsFromPaymentCurrency(crossToken.paymentCurrency)
            if (chainAndAddress.chainId && chainAndAddress.hexAddress) {
                toAddress = chainAndAddress.hexAddress
                toChain =
                    chainAndAddress.chainId as (typeof airdropChains)[keyof typeof airdropChains]
            }
        }
    }
    return {
        buttons: [],
        transaction: {
            chainId: `eip155:${toChain}`,
            method: 'eth_sendTransaction',
            params: {
                to: toAddress as `0x${string}`,
                value: '0',
                data: data,
                abi: [abiItem!, ...abiErrorItems],
            },
        },
    }
}
