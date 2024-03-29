import BigNumber from 'bignumber.js'
import { chainToEndpoint, contractTypes, typeToAddressMainnet } from './constants'
import { getActions_ByStream, getStream_ById } from './queries'

function parseStreamId(id: string) {
    // id is in the format of XX-YY-ZZ
    // XX can be either LL, LD, or a contract address, if it's a contract address, it'll be in the format of 0x...
    // when XX is "LD" or "LL", get the contract address from the categoryToAddressMainnet map
    const [categoryOrContract, chainId, streamId] = id.split('-')

    let contract = categoryOrContract

    if (Object.keys(contractTypes).includes(categoryOrContract)) {
        const typeKey = categoryOrContract as keyof typeof contractTypes
        contract = typeToAddressMainnet[typeKey]
    } else {
        if (!categoryOrContract.startsWith('0x')) {
            throw new Error('Invalid contract address')
        }

        contract = contract.toLowerCase()
    }

    return {
        contract,
        chainId,
        streamId,
    }
}

export async function getStreamData(id: string) {
    console.log('Getting stream data', id)

    if (!id) {
        return {}
    }

    const { contract, chainId, streamId } = parseStreamId(id)

    const res: any = await fetch(chainToEndpoint[chainId as keyof typeof chainToEndpoint], {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            query: getStream_ById,
            variables: {
                chainId: Number(chainId),
                streamId: `${contract}-${chainId}-${streamId}`,
            },
            operationName: 'getStream_ById',
        }),
    })
        .then((res) => res.json())
        .catch(console.log)

    if (!res?.data?.stream) {
        throw new Error('Stream not found')
    }

    return res.data.stream
}

export async function getStreamHistory(id: string) {
    console.log('Getting stream history', id)

    if (!id) {
        return []
    }

    const { contract, chainId, streamId } = parseStreamId(id)

    const res: any = await fetch(chainToEndpoint[chainId as keyof typeof chainToEndpoint], {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            query: getActions_ByStream,
            variables: {
                first: 21,
                streamId: `${contract}-${chainId}-${streamId}`,
                subgraphId: 1000000000,
            },
            operationName: 'getActions_ByStream',
        }),
    })
        .then((res) => res.json())
        .catch(console.log)

    if (!res?.data?.actions) {
        throw new Error('Stream not found')
    }

    return res.data.actions
}

export async function getStreamType(data: any) {
    switch (true) {
        case isCliff(data):
            return 'Cliff'
        case isLinear(data):
            return 'Linear'
        case isUnlockCliff(data):
            return 'Cliff Unlock'
        case isUnlockLinear(data):
            return 'Linear Unlock'
        case isStepper(data):
            return 'Stepper'
        case isMonthly(data):
            return 'Monthly'
        case isTimelock(data):
            return 'Timelock'
        case isExponential(data):
            return 'Exponential'
        case isCliffExponential(data):
            return 'Exponential Cliff'
        default:
            return 'Unknown'
    }
}

export const StreamCategory = {
    LOCKUP_LINEAR: 'LockupLinear',
    LOCKUP_DYNAMIC: 'LockupDynamic',
} as const

export function isCliff(stream: any): boolean {
    return stream.category === StreamCategory.LOCKUP_LINEAR && stream.cliff
}

export function isLinear(stream: any): boolean {
    return stream.category === StreamCategory.LOCKUP_LINEAR
}

export function isMonthly(stream: any): boolean {
    const UNLOCK_DURATION = 1000
    if (stream.category === StreamCategory.LOCKUP_DYNAMIC) {
        let areSegmentsEqual = true
        const initialSegmentDuration = new BigNumber(
            stream.segments[0].duration ??
                BigNumber(stream.segments[0].milestone)
                    .minus(BigNumber(stream.segments[0].startTime))
                    .times(1000)
        )

        if (stream.segments.length % 2 === 0) {
            stream.segments.forEach((segment: any, index: number) => {
                if (
                    index % 2 == 0 &&
                    !new BigNumber(
                        segment.duration ??
                            BigNumber(segment.milestone)
                                .minus(BigNumber(segment.startTime))
                                .times(1000)
                    ).eq(initialSegmentDuration)
                ) {
                    areSegmentsEqual = false
                }
                if (index % 2 == 1) {
                    if (
                        !new BigNumber(
                            segment.duration ??
                                BigNumber(segment.milestone)
                                    .minus(BigNumber(segment.startTime))
                                    .times(1000)
                        ).isLessThanOrEqualTo(new BigNumber(UNLOCK_DURATION))
                    ) {
                        return false
                    }
                } else if (!BigNumber(segment.amount).isZero()) {
                    return false
                }
            })
            return !areSegmentsEqual
        }
    }
    return false
}

export function isStepper(stream: any): boolean {
    const UNLOCK_DURATION = 1000
    if (stream.category === StreamCategory.LOCKUP_DYNAMIC && stream.segments.length % 2 === 0) {
        stream.segments.forEach((segment: any, index: number) => {
            if (index % 2 == 1) {
                if (
                    !new BigNumber(
                        segment.duration ??
                            BigNumber(segment.milestone)
                                .minus(BigNumber(segment.startTime))
                                .times(1000)
                    ).isLessThanOrEqualTo(new BigNumber(UNLOCK_DURATION))
                ) {
                    return false
                }
            } else if (!BigNumber(segment.amount).isZero()) {
                return false
            }
        })
        return true
    }
    return false
}

export function isUnlockCliff(stream: any): boolean {
    const EXPECTED_SEGMENTS = 3
    const UNLOCK_DURATION = 1000
    return (
        stream.category === StreamCategory.LOCKUP_DYNAMIC &&
        stream.segments.length === EXPECTED_SEGMENTS &&
        new BigNumber(
            stream.segments[0].duration ??
                BigNumber(stream.segments[0].milestone)
                    .minus(BigNumber(stream.segments[0].startTime))
                    .times(1000)
        ).isEqualTo(new BigNumber(UNLOCK_DURATION)) &&
        stream.segments[1].amount.isZero() &&
        new BigNumber(
            stream.segments[2].duration ??
                BigNumber(stream.segments[2].milestone)
                    .minus(BigNumber(stream.segments[2].startTime))
                    .times(1000)
        ).isEqualTo(new BigNumber(UNLOCK_DURATION)) &&
        BigNumber(stream.segments[3].exponent).isEqualTo(new BigNumber(1))
    )
}

export function isUnlockLinear(stream: any): boolean {
    const EXPECTED_SEGMENTS = 2
    const UNLOCK_DURATION = 1000

    // if (!Object.keys(stream.segments[0]).includes('duration')) {
    // }

    // const DURATION = milestone - starttime // in seconds, convert to ms
    console.log(
        BigNumber(stream.segments[1].exponent)
            .dividedBy(10 ** 18)
            .isEqualTo(new BigNumber(1))
    )
    return (
        stream.category === StreamCategory.LOCKUP_DYNAMIC &&
        stream.segments.length === EXPECTED_SEGMENTS &&
        new BigNumber(
            stream.segments[0].duration ??
                BigNumber(stream.segments[0].milestone)
                    .minus(BigNumber(stream.segments[0].startTime))
                    .times(1000)
        ).isLessThanOrEqualTo(new BigNumber(UNLOCK_DURATION)) &&
        BigNumber(stream.segments[1].exponent)
            .dividedBy(10 ** 18)
            .isEqualTo(new BigNumber(1))
    )
}

export function isTimelock(stream: any): boolean {
    const EXPECTED_SEGMENTS = 2
    const UNLOCK_DURATION = 1000
    return (
        stream.category === StreamCategory.LOCKUP_DYNAMIC &&
        stream.segments.length === EXPECTED_SEGMENTS &&
        new BigNumber(stream.duration)
            .minus(
                new BigNumber(
                    stream.segments[0].duration ??
                        BigNumber(stream.segments[0].milestone)
                            .minus(BigNumber(stream.segments[0].startTime))
                            .times(1000)
                )
            )
            .isEqualTo(UNLOCK_DURATION)
    )
}

export function isExponential(stream: any): boolean {
    const EXPECTED_SEGMENTS = 1
    return (
        stream.category === StreamCategory.LOCKUP_DYNAMIC &&
        stream.segments.length === EXPECTED_SEGMENTS &&
        BigNumber(stream.segments[0].exponent).isEqualTo(new BigNumber(3))
    )
}

export function isCliffExponential(stream: any): boolean {
    const UNLOCK_DURATION = 1000
    const EXPECTED_SEGMENTS = 3
    return (
        stream.category === StreamCategory.LOCKUP_DYNAMIC &&
        stream.segments.length === EXPECTED_SEGMENTS &&
        stream.segments[0].amount.isZero() &&
        new BigNumber(
            stream.segments[1].duration ??
                BigNumber(stream.segments[1].milestone)
                    .minus(BigNumber(stream.segments[1].startTime))
                    .times(1000)
        ).isLessThanOrEqualTo(new BigNumber(UNLOCK_DURATION)) &&
        BigNumber(stream.segments[2].exponent).isEqualTo(new BigNumber(3))
    )
}

