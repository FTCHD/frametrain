import type { Config, Storage } from '..'

export default function PageView(config: Config, storage: Storage, viewerFid: string) {
    const isOwner = viewerFid === config.owner;
    const isWinner = viewerFid === storage.currentAd.winner;
    const isBidder = storage.bids.some(bid => bid.bidder === viewerFid);
    const currentBid = storage.bids.find(bid => bid.bidder === viewerFid)?.amount || 0;

    const formatDate = (date: number | undefined) => {
        return date ? new Date(date).toLocaleString() : 'Not set';
    };

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                backgroundColor: config.cover.backgroundColor,
                color: config.cover.textColor,
                fontFamily: 'Roboto, sans-serif',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
            }}
        >
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '15px' }}>Ad Space Details</h1>

            <div style={{ marginBottom: '15px' }}>
                <p><strong>Mode:</strong> {config.mode}</p>
                <p><strong>Current Highest Bid:</strong> {storage.highestBid} {config.currency}</p>
                {config.mode === 'Auction' && (
                    <p><strong>Auction Deadline:</strong> {formatDate(config.deadline)}</p>
                )}
                {config.mode === 'Continuous' && (
                    <p><strong>Ad Expiry:</strong> {formatDate(storage.currentAd.expiryTime)}</p>
                )}
            </div>

            {isOwner && (
                <div style={{ marginBottom: '15px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>Owner Dashboard</h2>
                    <p><strong>Total Bids:</strong> {storage.bids.length}</p>
                    <p><strong>Highest Bidder:</strong> {storage.bids[storage.bids.length - 1]?.bidder || 'No bids yet'}</p>
                </div>
            )}

            {isOwner && (
                <div style={{ marginTop: '20px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>All Bids</h2>
                    <Table>
                        <thead>
                            <tr>
                                <th>Bidder</th>
                                <th>Amount</th>
                                <th>Time</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {storage.bids.map((bid, index) => (
                                <tr key={index}>
                                    <td>{bid.bidder}</td>
                                    <td>{bid.amount} {config.currency}</td>
                                    <td>{new Date(bid.timestamp).toLocaleString()}</td>
                                    <td>
                                        <Button onClick={() => acceptBid(bid.bidder)}>Accept</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            )}

            {isWinner && (
                <div style={{ marginBottom: '15px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>Winner's Corner</h2>
                    <p>Congratulations! You are the current ad space winner.</p>
                    <p><strong>Your Winning Bid:</strong> {storage.highestBid} {config.currency}</p>
                </div>
            )}

            {isBidder && !isWinner && (
                <div style={{ marginBottom: '15px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>Your Bid Status</h2>
                    <p><strong>Your Current Bid:</strong> {currentBid} {config.currency}</p>
                    <p><strong>Highest Bid:</strong> {storage.highestBid} {config.currency}</p>
                    {storage.highestBid > currentBid && (
                        <p style={{ color: 'red' }}>Your bid has been outbid. Consider placing a higher bid!</p>
                    )}
                </div>
            )}

            {!isOwner && !isWinner && !isBidder && (
                <div style={{ marginBottom: '15px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>Place Your Bid</h2>
                    <p>Enter your bid amount to participate in this ad space auction.</p>
                    <p><strong>Current Highest Bid:</strong> {storage.highestBid} {config.currency}</p>
                </div>
            )}

            <div style={{ fontSize: '14px', color: 'gray' }}>
                <p>Ad Space ID: {config.id}</p>
                <p>Total Participants: {new Set(storage.bids.map(bid => bid.bidder)).size}</p>
            </div>
        </div>
    );
}