export default function RefreshView() {
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                fontSize: 44,
                flexDirection: 'column',
                flexGrow: 1,
                padding: 32,
                textAlign: 'left',
                alignItems: 'center',
                height: '100%',
                backgroundColor: 'rgb(255,255,255)',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    alignItems: 'center',
                    flexGrow: 1,
                    padding: 32,
                    textAlign: 'center',
                    color: 'rgb(32,32,32)',
                    fontWeight: 600,
                    fontSize: 24,
                }}
            >
                Waiting for payment confirmation..
            </div>
        </div>
    )
}
