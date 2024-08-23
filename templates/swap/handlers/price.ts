'use server'
import type { BuildFrameData, FrameValidatedActionPayload } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import type { Config, Storage } from '..'
import { fetchPrice } from '../common/0x'
import PriceView from '../views/Price'
import initial from './initial'

export default async function price({
    body,
    config,
    params,
}: {
    body: FrameValidatedActionPayload
    config: Config
    storage: Storage
    params:
        | {
              buyAmount: string
          }
        | undefined
}): Promise<BuildFrameData> {
    if (!config.pool) {
        return initial({ config })
    }

    let amount = 0

    const token0 = config.pool.primary === 'token0' ? config.pool.token0 : config.pool.token1
    const token1 = config.pool.primary === 'token0' ? config.pool.token1 : config.pool.token0

    getAmount: {
        if (params?.buyAmount !== undefined) {
            amount = Number(params.buyAmount)
            break getAmount
        }
        const buttonIndex = body.validatedData.tapped_button.index

        switch (buttonIndex) {
            case 1: {
                const textInput = body.validatedData.input?.text
                if (!textInput) {
                    throw new FrameError('An amount must be provided')
                }

                if (isNaN(Number(textInput))) {
                    throw new FrameError('Invalid amount input')
                }

                amount = Number.parseFloat(textInput)

                break
            }

            default: {
                if (!config.amounts.length) {
                    throw new FrameError('Enter a custom amount')
                }

                const foundAmount = config.amounts.find((_, i) => i === buttonIndex - 2)
                if (!foundAmount) {
                    throw new FrameError('Invalid amount')
                }

                amount = +foundAmount
                break
            }
        }
    }

    const estimates = await fetchPrice({
        buyToken: token1,
        sellToken: token0,
        network: config.pool.network,
        amount: `${amount}`,
    })

    if (!estimates) {
        throw new FrameError('Estimated price not available')
    }

    return {
        buttons: [
            {
                label: '←',
            },
            {
                label: 'Buy Now',
                action: 'tx',
                handler: 'txData',
            },
        ],
        component: PriceView({ token0, token1, network: config.pool.network, amount, estimates }),
        handler: 'success',
        params: {
            buyAmount: amount,
        },
    }
}
