import { GATING_ADVANCED_OPTIONS, type GATING_ALL_OPTIONS } from '@/sdk/components/gating/constants'
import type { GatingRequirementsType, GatingType } from '@/sdk/components/gating/types'
import { FrameError } from '@/sdk/error'
import { getFarcasterUserChannels } from '@/sdk/neynar'
import { type ChainKey, getViem } from '@/sdk/viem'
import { erc20Abi, erc721Abi, formatUnits, getAddress, getContract, parseAbi } from 'viem'
import type { FramePayloadValidated } from './farcaster'

const ERC1155_ABI = parseAbi([
    'function name() public view returns (string)',
    'function symbol() public view returns (string)',
    'function balanceOf(address _owner, uint256 _id) public view returns (uint256)',
])

async function getMoxieUserVestingAddresses(beneficiary: string[]) {
    if (beneficiary.length === 0) {
        return []
    }

    try {
        const GET_VESTING_ADDRESSES = `query UserVestingAddresses($beneficiaryAddresses: [Bytes!]) {
    tokenLockWallets(where: { beneficiary_in: $beneficiary }) {
      address:id
    }
  }`

        const variables = {
            beneficiary,
        }
        const response = await fetch(
            'https://api.studio.thegraph.com/query/23537/moxie_vesting_mainnet/version/latest',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: GET_VESTING_ADDRESSES, variables }),
            }
        )

        const json = (await response.json()) as {
            data: { tokenLockWallets: { address: string }[] }
        }

        if (!json.data?.tokenLockWallets) {
            return []
        }
        const vestingAddresses = json.data.tokenLockWallets.map((wallet) => wallet.address)
        return vestingAddresses
    } catch {
        return []
    }
}
async function checkMoxieFanToken(userAddresses: string[], tokenSymbol: string, minAmount = 1) {
    if (userAddresses.length === 0) {
        return
    }

    try {
        const GET_BALANCES = `query GetBalances($userAddresses: [ID!], $fanTokenAddress: String) {
    users(where: { id_in: $userAddresses }) {
      portfolio(where: { subjectToken: $fanTokenAddress }) {
        balance
     }
    }
  }`

        const [symbol, fanTokenAddress] = tokenSymbol.split(',')

        const variables = {
            userAddresses,
            fanTokenAddress,
        }
        const response = await fetch(
            'https://api.studio.thegraph.com/query/23537/moxie_protocol_stats_mainnet/version/latest',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: GET_BALANCES, variables }),
            }
        )

        const json = (await response.json()) as {
            data: { users: { portfolio: { balance: string }[] }[] }
        }

        const isPositive = json.data.users.some((user) =>
            user.portfolio.some((folio) => Number(folio.balance) >= minAmount * 10 ** 18)
        )
        if (isPositive) {
            return
        }
        throw new Error(`FT_ERROR:You must have at least ${minAmount} of ${symbol} fanToken`)
    } catch (e) {
        const error = e as Error
        const message = error.message.startsWith('FT_ERROR:')
            ? error.message.replace('FT_ERROR:', '')
            : 'Failed to fetch Moxie FanToken data'
        throw new FrameError(message)
    }
}

async function checkOpenRankScore(fid: number, owner: number, score: number) {
    const url = `https://graph.cast.k3l.io/scores/personalized/engagement/fids?k=${score}&limit=1000&lite=true`
    const options = {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify([owner]),
    }

    const openRank = async () => {
        try {
            const response = await fetch(url, options)
            const data = (await response.json()) as {
                result: { fid: number; score: number }[]
            }

            const isPositive = data.result.some((item) => item.fid === fid)
            if (!isPositive) {
                return `You must have a score of at least ${score}.`
            }
        } catch {
            return 'Could not fetch your OpenRank data.'
        }
    }

    const error = await openRank()

    if (error) {
        throw new FrameError(error)
    }
}

async function checkOwnsErc20(
    addresses: string[],
    chain: ChainKey,
    contract: string,
    symbol: string,
    minAmount = 1
) {
    const token = getContract({
        client: getViem(chain),
        address: getAddress(contract),
        abi: erc20Abi,
    })

    const decimals = await token.read.decimals()

    for (const ownerAddress of addresses) {
        const owner = getAddress(ownerAddress)
        const balanceOf = await token.read.balanceOf([owner])
        const balance = formatUnits(balanceOf, decimals)

        if (Number(balance) >= minAmount) {
            return
        }
    }

    throw new FrameError(`You must have at least ${minAmount} ${symbol}.`)
}

async function checkOwnsErc721(
    addresses: string[],
    chain: ChainKey,
    contract: string,
    symbol: string,
    minAmount = 1
) {
    const token = getContract({
        client: getViem(chain),
        address: getAddress(contract),
        abi: erc721Abi,
    })

    for (const ownerAddress of addresses) {
        const owner = getAddress(ownerAddress)
        const balanceOf = await token.read.balanceOf([owner])
        const balance = Number(balanceOf)

        if (balance >= minAmount) {
            return
        }
    }

    throw new FrameError(`You must have at least ${minAmount} ${symbol}.`)
}

async function checkOwnsErc1155(
    addresses: string[],
    chain: ChainKey,
    contract: string,
    symbol: string,
    tokenId: number,
    minAmount = 1
) {
    const token = getContract({
        client: getViem(chain),
        address: getAddress(contract),
        abi: ERC1155_ABI,
    })

    for (const ownerAddress of addresses) {
        const owner = getAddress(ownerAddress)
        const balanceOf = await token.read.balanceOf([owner, BigInt(tokenId)])
        const balance = Number(balanceOf)

        if (balance >= minAmount) {
            return
        }
    }

    throw new FrameError(`You must have at least ${minAmount} ${symbol}.`)
}

async function checkChannelMembership(fid: number, channel: string) {
    const userChannels = await getFarcasterUserChannels(fid)
    if (!userChannels.map((c) => c.id).includes(channel)) {
        throw new FrameError(`You must be a member of /${channel} channel.`)
    }
}

async function checkFid(fid: number, minFid: number, maxFid: number) {
    if (minFid > 0 && fid < minFid) {
        throw new FrameError(`FID must be greater than or equal to ${minFid}.`)
    }

    if (maxFid > 0 && fid >= maxFid) {
        throw new FrameError(`FID must be less than or equal to ${maxFid}.`)
    }
}

async function checkLiked(body: FramePayloadValidated) {
    if (!body.cast.viewer_context?.liked) {
        throw new FrameError('You must like this frame.')
    }
}

async function checkRecasted(body: FramePayloadValidated) {
    if (!body.cast.viewer_context?.recasted) {
        throw new FrameError('You must recast this frame.')
    }
}

async function checkFollowingMe(body: FramePayloadValidated) {
    if (!body.interactor.viewer_context?.following) {
        throw new FrameError('You must follow the creator.')
    }
}

async function checkFollowedByMe(body: FramePayloadValidated) {
    if (!body.interactor.viewer_context?.followed_by) {
        throw new FrameError('You must be followed by the creator.')
    }
}

async function checkEthWallet(body: FramePayloadValidated) {
    if (!body.interactor.verified_addresses.eth_addresses.length) {
        throw new FrameError('You must have an Ethereum wallet.')
    }
}

async function checkSolWallet(body: FramePayloadValidated) {
    if (!body.interactor.verified_addresses.sol_addresses.length) {
        throw new FrameError('You must have a Solana wallet.')
    }
}

const keyToValidator: Record<
    (typeof GATING_ALL_OPTIONS)[number],
    (requirements: GatingRequirementsType, body: FramePayloadValidated) => Promise<void>
> = {
    channels: async (requirements, body) => {
        for (const channel of requirements['channels']!) {
            await checkChannelMembership(body.interactor.fid, channel)
        }
    },
    followedByMe: async (_requirements, body) => await checkFollowedByMe(body),
    followingMe: async (_requirements, body) => await checkFollowingMe(body),
    liked: async (_requirements, body) => await checkLiked(body),
    recasted: async (_requirements, body) => await checkRecasted(body),
    eth: async (_requirements, body) => await checkEthWallet(body),
    sol: async (_requirements, body) => await checkSolWallet(body),
    minFid: async (requirements, body) =>
        await checkFid(body.interactor.fid, requirements['minFid']!, 0),
    maxFid: async (requirements, body) =>
        await checkFid(body.interactor.fid, 0, requirements['maxFid']!),
    exactFids: async (requirements, body) => {
        for (const fid of requirements['exactFids']!) {
            await checkFid(body.interactor.fid, fid, fid)
        }
    },
    erc20: async (requirements, body) => {
        for (const token of requirements['erc20']!) {
            await checkOwnsErc20(
                body.interactor.verified_addresses.eth_addresses,
                token.network,
                token.address,
                token.symbol,
                token.balance
            )
        }
    },
    erc721: async (requirements, body) => {
        for (const token of requirements['erc721']!) {
            await checkOwnsErc721(
                body.interactor.verified_addresses.eth_addresses,
                token.network,
                token.address,
                token.symbol,
                token.balance
            )
        }
    },
    erc1155: async (requirements, body) => {
        for (const token of requirements['erc1155']!) {
            await checkOwnsErc1155(
                body.interactor.verified_addresses.eth_addresses,
                token.network,
                token.address,
                token.symbol,
                token.tokenId!,
                token.balance
            )
        }
    },
    score: async (requirements, body) =>
        await checkOpenRankScore(
            body.interactor.fid,
            requirements['score']!.owner,
            requirements['score']!.score
        ),
    moxie: async (requirements, body) => {
        const userAddresses = body.interactor.verified_addresses.eth_addresses
        for (const token of requirements['moxie']!) {
            // NOTE(copied from moxie dev docs): Moxie protocol users have Moxie token currently vesting in their vesting contract. A huge portion of them use these to bid on auctions and buy/sell fan tokens on the Moxie protocol.
            // Therefore, it is important that you include the user's vesting addresses in the query to get all the fan tokens owned by a certain user.
            const userVestingAddresses = await getMoxieUserVestingAddresses(userAddresses)
            await checkMoxieFanToken(
                [...userAddresses, ...userVestingAddresses],
                `${token.symbol},${token.address}`,
                token.balance
            )
        }
    },
}

export async function runGatingChecks(
    body: FramePayloadValidated,
    config: GatingType | undefined
): Promise<void> {
    if (!config) {
        return
    }

    for (const key of config.enabled) {
        // handle case where this check is enabled, but not configured
        if (
            GATING_ADVANCED_OPTIONS.includes(key) &&
            !config.requirements[key as keyof GatingRequirementsType]
        ) {
            continue
        }
        const validator = keyToValidator[key as keyof GatingRequirementsType]
        await validator(config.requirements, body)
    }
}
