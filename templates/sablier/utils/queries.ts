export const getStream_ById = `
query getStream_ById($streamId: ID!) {
  stream(id: $streamId) {
	...StreamFragment
  }
}

fragment AssetFragment on Asset {
  id
  address
  chainId
  decimals
  name
  symbol
}

fragment BatchFragment on Batch {
  id
  label
  size
}

fragment ContractFragment on Contract {
  id
  address
  category
  version
}

fragment SegmentFragment on Segment {
  id
  position
  amount
  exponent
  milestone
  endTime
  startTime
  startAmount
  endAmount
}

fragment StreamFragment on Stream {
  id
  tokenId
  subgraphId
  chainId
  alias
  category
  funder
  sender
  recipient
  hash
  timestamp
  depositAmount
  startTime
  endTime
  cliff
  cliffTime
  cliffAmount
  cancelable
  renounceTime
  canceled
  canceledTime
  withdrawnAmount
  intactAmount
  position
  proxied
  proxender
  transferable
  version
  asset {
	...AssetFragment
  }
  batch {
	...BatchFragment
  }
  contract {
	...ContractFragment
  }
  segments {
	...SegmentFragment
  }
}
`

export const getActions_ByStream = `
query getActions_ByStream($first: Int!, $streamId: String!, $subgraphId: BigInt!) {
	actions(
	  first: $first
	  orderBy: subgraphId
	  orderDirection: desc
	  where: {stream: $streamId, subgraphId_lt: $subgraphId}
	) {
	  ...ActionFragment
	  stream {
		id
		asset {
		  ...AssetFragment
		}
	  }
	}
  }
  
  fragment ContractFragment on Contract {
	id
	address
	category
	version
  }
  
  fragment ActionFragment on Action {
	id
	chainId
	subgraphId
	stream {
	  id
	}
	category
	hash
	block
	timestamp
	from
	addressA
	addressB
	amountA
	amountB
	contract {
	  ...ContractFragment
	}
  }
  
  fragment AssetFragment on Asset {
	id
	address
	chainId
	decimals
	name
	symbol
  }
`