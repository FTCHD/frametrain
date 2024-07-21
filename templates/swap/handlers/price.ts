'use server'
import type {
    BuildFrameData,
    FrameActionPayload,
    FrameValidatedActionPayload,
} from '@/lib/farcaster'
import type { Config, Storage } from '..'
import PriceView from '../views/Price'
import initial from './initial'
import { FrameError } from '@/sdk/error'
import { fetchPrice } from '../utils/0x'

export default async function price({
    body,
    config,
    storage,
    params,
}: {
    body: FrameValidatedActionPayload
    config: Config
    storage: Storage
    params: any
}): Promise<BuildFrameData> {
    if (!config.pool) {
        return initial({ config })
    }

    let amount = 0
    const buttonIndex = body.validatedData.tapped_button.index

    const token0 = config.pool.primary === 'token0' ? config.pool.token0 : config.pool.token1
    const token1 = config.pool.primary === 'token0' ? config.pool.token1 : config.pool.token0

    switch (buttonIndex) {
        case 1: {
            const textInput = body.validatedData.input?.text
            if (!textInput) {
                throw new FrameError('An amount must be provided')
            }

            console.log({ float: Number.parseFloat(textInput), textInput })

            if (isNaN(Number(textInput))) {
                throw new FrameError('Invalid amount input')
            }

            amount = Number.parseFloat(textInput)

            break
        }

        default: {
            if (config.amounts.length) {
                amount = +config.amounts[buttonIndex - 2]
            }
            break
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

    console.info('price handler >>', { buttonIndex, amount, estimates, token0, token1 })

    return {
        buttons: [
            {
                label: '←',
            },
            {
                label: 'Confirm Swap',
                action: 'tx',
                target: '/swap',
            },
        ],
        component: PriceView({ token0, token1, network: config.pool.network, amount, estimates }),
        handler: 'success',
        params: {
            amount: estimates.price,
        },
    }
}
