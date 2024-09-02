// these do not require a requirements field, so we know not to check them
export const GATING_SIMPLE_OPTIONS = [
    'liked',
    'recasted',
    'eth',
    'sol',
    'followedByMe',
    'followingMe',
]
export const GATING_ADVANCED_OPTIONS = [
    'channels',
    'minFid',
    'maxFid',
    'exactFids',
    'score',
    'erc20',
    'erc721',
    'erc1155',
    // 'followedBy',
    // 'following',
]
export const GATING_ALL_OPTIONS = [...GATING_SIMPLE_OPTIONS, ...GATING_ADVANCED_OPTIONS]