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
    console.log({ config })
    const FRAME_TRAIN_OPERATOR_PRIVATE_KEY = process.env
        .FRAME_TRAIN_OPERATOR_PRIVATE_KEY as `0x${string}`

    if (!FRAME_TRAIN_OPERATOR_PRIVATE_KEY) {
        throw new FrameError('FRAME_TRAIN_OPERATOR_PRIVATE_KEY is not set')
    }

    const chainId = airdropChains[config.chain]
    console.log(chainId)

    const frameOperatorAddress = privateKeyToAddress(FRAME_TRAIN_OPERATOR_PRIVATE_KEY)
    console.log(frameOperatorAddress)
    const args = [frameOperatorAddress, maxInt256]
    const functionName = 'approve'
    const abiItem = getAbiItem({
        abi: erc20Abi,
        name: functionName,
        args,
    } as GetAbiItemParameters)
    console.log(abiItem)
    let data
    try {
        data = encodeFunctionData({
            abi: erc20Abi,
            functionName,
            args,
        } as EncodeFunctionDataParameters)
    } catch (error) {
        console.log(error)
    }
    console.log(data)
    const abiErrorItems = (erc20Abi as Abi).filter((item) => item.type === 'error')

    return {
        buttons: [],
        transaction: {
            chainId: `eip155:${chainId}`,
            method: 'eth_sendTransaction',
            params: {
                to: config.tokenAddress as `0x${string}`,
                value: '0',
                data: data,
                abi: [abiItem!, ...abiErrorItems],
            },
        },
    }
}
