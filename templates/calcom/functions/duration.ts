'use server'
import type { BuildFrameData, FrameActionPayload } from '@/lib/farcaster'
import type { Config, State } from '..'
import PageView from '../views/Duration'
import NotSatisfied from '../views/NotSatisfied'
import { init, fetchQuery } from '@airstack/node'

export default async function duration(
    body: FrameActionPayload,
    config: Config,
    state: State,
    params: any
): Promise<BuildFrameData> {
    init(process.env.AIRSTACK_API_KEY || '')

    let containsUserFID = true
    let nftGate = true
    if (config.karmaGating) {
        const url = 'https://graph.cast.k3l.io/scores/personalized/engagement/fids?k=1&limit=1000'
        const options = {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: `["${config.fid}"]`,
        }

        try {
            const response = await fetch(url, options)
            const data = await response.json()

            containsUserFID = data.result.some((item: any) => item.fid === body.untrustedData.fid)
        } catch (error) {
            console.log(error)
        }
    }
    if (config.nftGating) {
        if (body.validatedData.interactor.verified_addresses.eth_addresses.length === 0) {
            return {
                buttons: [],
                component: NotSatisfied(
                    config,
                    'Please Connect wallet to your farcaster account and hold the NFT to schedule the call.'
                ),
                functionName: 'initial',
            }
        }
        const query = `query MyQuery {
  TokenBalances(
    input: {filter: {tokenAddress: {_eq: "${config.nftAddress}"}}, blockchain: ethereum, limit: 1}
  ) {
    TokenBalance {
      owner {
        socials(
          input: {filter: {dappName: {_eq: farcaster}, userAssociatedAddresses: {_in: ["${body.validatedData.interactor.verified_addresses.eth_addresses.join(
              '","'
          )}"]}}}
        ) {
          userId
          profileName
          userAddress
          userAssociatedAddresses
        }
      }
    }
  }
}`

        const { data, error } = await fetchQuery(query)

        if (
            data.TokenBalances.TokenBalance === null
            // data.TokenBalances.TokenBalance?.owner?.socials === null
        ) {
            nftGate = false
        }
    }

    if (!containsUserFID) {
        return {
            buttons: [],
            component: NotSatisfied(
                config,
                'You havent satisfied the requirements to meet the call. Only people within 2nd degree of connection can schedule the call.'
            ),
            functionName: 'initial',
        }
    }
    if (!nftGate) {
        return {
            buttons: [],
            component: NotSatisfied(
                config,
                `You havent satisfied the requirements to meet the call. You need to hold the NFT - ${config.nftAddress} to schedule the call.`
            ),
            functionName: 'initial',
        }
    }
    return {
        buttons: [
            {
                label: '15min',
            },
            {
                label: '30min',
            },
        ],

        component: PageView(config),
        functionName: 'date',
    }
}
