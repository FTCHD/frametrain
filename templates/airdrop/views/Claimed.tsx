export default function ClaimedView() {
    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'linear-gradient(45deg, #00BFFF, #FF1493)',
                fontFamily: 'Inter',
                color: 'white',
                overflow: 'hidden',
            }}
        >
            <div
                style={{
                    fontSize: 120,
                    fontWeight: 'bold',
                    marginBottom: 20,
                    textShadow: '0 0 10px rgba(255,255,255,0.5)',
                }}
            >
                🎉
            </div>
            <div
                style={{
                    fontSize: 48,
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: 4,
                    marginBottom: 20,
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                }}
            >
                Congratulations!
            </div>
            <div
                style={{
                    fontSize: 32,
                    fontWeight: 'medium',
                    maxWidth: '80%',
                    textAlign: 'center',
                    lineHeight: 1.4,
                    marginBottom: 40,
                }}
            >
                You have successfully claimed your airdrop!
            </div>
        </div>
    )
}
