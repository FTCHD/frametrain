export default function ApprovedView() {
    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'linear-gradient(135deg, #1a2980 0%, #26d0ce 100%)',
                fontFamily: 'Arial',
                color: 'white',
                overflow: 'hidden',
            }}
        >
            <div
                style={{
                    fontSize: 120,
                    marginBottom: 30,
                }}
            >
                🛡️
            </div>
            <div
                style={{
                    fontSize: 80,
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: 3,
                    marginBottom: 20,
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                }}
            >
                Tokens Approved ✅
            </div>
            <div
                style={{
                    fontSize: 44,
                    maxWidth: '80%',
                    textAlign: 'center',
                    lineHeight: 1.4,
                    marginBottom: 30,
                }}
            >
                You have successfully authorized the spending of your tokens
            </div>
        </div>
    )
}
