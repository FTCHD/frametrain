import BigNumber from 'bignumber.js'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
import { chainToEndpoint, chainToTypeMap, contractTypes } from './constants'
import { getActions_ByStream, getStream_ById } from './queries'

dayjs.extend(duration)
dayjs.extend(relativeTime)

function parseStreamId(id: string) {
    // id is in the format of XX-YY-ZZ
    // XX can be either LL, LD, or a contract address, if it's a contract address, it'll be in the format of 0x...
    // when XX is "LD" or "LL", get the contract address from the categoryToAddressMainnet map
    const [categoryOrContract, chainId, streamId] = id.split('-')

    let contract = categoryOrContract

    if (Object.keys(contractTypes).includes(categoryOrContract)) {
        const typeKey = categoryOrContract as keyof typeof contractTypes
        const typeMap = chainToTypeMap[chainId as keyof typeof chainToTypeMap]
        contract = typeMap[typeKey]
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
    if (!id) {
        return {}
    }

    const { contract, chainId, streamId } = parseStreamId(id)

    // console.log('chainId', chainId)
    // console.log('contract', contract)
    // console.log('streamId', streamId)

    const res: any = await fetch(chainToEndpoint[chainId as keyof typeof chainToEndpoint], {
        method: 'POST',
        cache: 'force-cache',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            query: getStream_ById,
            variables: {
                chainId: chainId,
                streamId: `${contract}-${chainId}-${streamId}`,
            },
            operationName: 'getStream_ById',
        }),
    })
        .then((res) => res.json())
        .catch(console.error)

    if (!res?.data?.stream) {
        throw new Error('Stream not found')
    }

    return res.data.stream
}

// export function getStreamStatus(streamData: any) {
//     const now = dayjs()

//     const startTime = streamData.startTime
//     const endTime = streamData.endTime
//     const cliffTime = streamData.cliffTime

//     const duration = new BigNumber(endTime).minus(new BigNumber(startTime))

//     const isCanceled = streamData.canceled
//     // const intactAmount = new BigNumber(streamData.intactAmount)

//     const streamedDuration = BigNumber.max(
//         new BigNumber(cliffTime || 0).minus(new BigNumber(startTime)),
//         new BigNumber(0)
//     )

//     const streamedDurationPercentage = streamedDuration.dividedBy(duration).multipliedBy(100)

//     console.log('streamedDuration', streamedDuration)
//     console.log('streamedDurationPercentage', streamedDurationPercentage)

//     // Check for a canceled stream
//     if (isCanceled) {
//         // if (intactAmount.isEqualTo(0)) {
//         //     return 'DEPLETED_CANCELED'
//         // }
//         return 'CANCELED'
//     }

//     // Check for a settled stream
//     if (streamedDurationPercentage.isEqualTo(new BigNumber(100))) {
//         // if (intactAmount.isEqualTo(0)) {
//         //     return 'DEPLETED_SETTLED'
//         // }
//         return 'SETTLED'
//     }

//     // Check for a pending stream that has not started yet
//     if (now.isBefore(dayjs().format(startTime))) {
//         return 'PENDING'
//     }

//     return 'STREAMING'
// }

export function getStreamDuration(streamData: any) {
    const startTime = streamData.startTime
    const endTime = streamData.endTime

    const duration = endTime - startTime

    const readableDuration = dayjs.duration(duration, 'seconds').humanize()

    return readableDuration.replace('a ', '1 ')
}

export async function getStreamHistory(id: string) {
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
        .catch(console.error)

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

export async function getLogoForToken(chainId: number, address: string) {
    const tokenList = await fetch(
        'https://community-token-list-sablier.vercel.app/sablier-community.tokenlist.json'
    )
        .then((res) => res.json())
        .then((res) => res.tokens)

    return (
        tokenList
            .filter(
                (token: any) =>
                    token.address.toLowerCase() == address.toLowerCase() && token.chainId == chainId
            )
            .map((token: any) => token.logoURI)[0] ??
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAxOCAxOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZyBjbGlwLXBhdGg9InVybCgjY2xpcDBfMjcyXzIzMzI1KSIgdmVjdG9yRWZmZWN0PSJub24tc2NhbGluZy1zdHJva2UiPgogICAgPGNpcmNsZQogICAgICByPSI5IgogICAgICBjeD0iOSIKICAgICAgY3k9IjkiCiAgICAgIGZpbGw9IiNGRkZGRkYiCiAgICAvPgogICAgPHBhdGgKICAgICAgZD0iTTYuMTg3NSAxMy41MDAxTDguNDM3NSA0LjUwMDEyTTkuNTYyNSAxMy41MDAxTDExLjgxMjUgNC41MDAxMk01LjYyNSA3LjMxMjYySDEzLjVNNC41IDEwLjY4NzZIMTIuMzc1IgogICAgICBzdHJva2U9IiMyOTJGM0IiIHN0cm9rZS13aWR0aD0iMSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiAvPgogIDwvZz4KICA8ZGVmcz4KICAgIDxjbGlwUGF0aCBpZD0iY2xpcDBfMjcyXzIzMzI1Ij4KICAgICAgPHJlY3Qgd2lkdGg9IjE4IiBoZWlnaHQ9IjE4IiAvPgogICAgPC9jbGlwUGF0aD4KICA8L2RlZnM+Cjwvc3ZnPg=='
    )
}